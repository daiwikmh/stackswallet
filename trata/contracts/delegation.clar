;; escrow-delegation.clar
;; PROPER escrow-based delegation system for Stacks
;; Based on proven escrow patterns from Stacks ecosystem

;; === ERROR CODES ===
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_DELEGATION_EXPIRED (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))
(define-constant ERR_DELEGATION_NOT_FOUND (err u103))
(define-constant ERR_INVALID_PARAMS (err u104))
(define-constant ERR_ALREADY_EXISTS (err u105))
(define-constant ERR_TRANSFER_FAILED (err u106))
(define-constant ERR_INSUFFICIENT_ALLOWANCE (err u107))

;; === CONSTANTS ===
(define-constant BLOCKS_PER_DAY u144) ;; ~144 blocks per day on Stacks

;; === DATA STRUCTURES ===

;; Delegation escrow accounts - simplified approach
(define-map delegations
  { owner: principal, delegate: principal }
  {
    amount: uint,             ;; Total amount in escrow (in microSTX)
    daily-limit: uint,        ;; Maximum amount delegate can spend per day  
    spent-today: uint,        ;; Amount spent today
    spent-total: uint,        ;; Total amount spent so far
    last-day: uint,           ;; Last day spending was reset
    start-block: uint,        ;; When delegation becomes active
    end-block: uint,          ;; When delegation expires
    active: bool              ;; Can be manually disabled
  }
)

;; === PRIVATE FUNCTIONS ===

;; Get current day number (for daily limit reset)
(define-private (get-current-day)
  (/ stacks-block-height BLOCKS_PER_DAY)
)

;; Check if delegation is valid and active
(define-private (is-delegation-active (owner principal) (delegate principal))
  (match (map-get? delegations { owner: owner, delegate: delegate })
    delegation (and 
      (get active delegation)
      (>= stacks-block-height (get start-block delegation))
      (<= stacks-block-height (get end-block delegation))
      (> (get amount delegation) u0)  ;; Must have funds
    )
    false
  )
)

;; Reset daily spending if new day
(define-private (reset-daily-if-needed (owner principal) (delegate principal))
  (let (
    (current-day (get-current-day))
    (delegation (unwrap! 
      (map-get? delegations { owner: owner, delegate: delegate }) 
      ERR_DELEGATION_NOT_FOUND
    ))
  )
    (if (> current-day (get last-day delegation))
      ;; New day - reset daily spending
      (map-set delegations
        { owner: owner, delegate: delegate }
        (merge delegation { 
          spent-today: u0, 
          last-day: current-day 
        })
      )
      ;; Same day - no change needed
      true
    )
    (ok true)
  )
)

;; === PUBLIC FUNCTIONS ===

;; Create delegation and deposit funds in ONE transaction
(define-public (create-delegation-and-deposit
  (delegate principal)
  (amount uint)
  (daily-limit uint)
  (duration-days uint)
)
  (let (
    (start-block stacks-block-height)
    (end-block (+ stacks-block-height (* duration-days BLOCKS_PER_DAY)))
    (current-day (get-current-day))
  )
    ;; Validate inputs
    (asserts! (> amount u0) ERR_INVALID_PARAMS)
    (asserts! (> daily-limit u0) ERR_INVALID_PARAMS)
    (asserts! (> duration-days u0) ERR_INVALID_PARAMS)
    (asserts! (<= daily-limit amount) ERR_INVALID_PARAMS)
    (asserts! (not (is-eq tx-sender delegate)) ERR_INVALID_PARAMS)
    
    ;; Check delegation doesn't already exist
    (asserts! (is-none (map-get? delegations { owner: tx-sender, delegate: delegate })) 
      ERR_ALREADY_EXISTS)
    
    ;; KEY: Transfer STX from user to contract FIRST
    ;; This is where the actual money movement happens!
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Store delegation data
    (map-set delegations
      { owner: tx-sender, delegate: delegate }
      {
        amount: amount,
        daily-limit: daily-limit,
        spent-today: u0,
        spent-total: u0,
        last-day: current-day,
        start-block: start-block,
        end-block: end-block,
        active: true
      }
    )
    
    (ok {
      delegate: delegate,
      amount-deposited: amount,
      daily-limit: daily-limit,
      expires-at: end-block,
      contract-balance: (stx-get-balance (as-contract tx-sender))
    })
  )
)

;; Add more funds to existing delegation
(define-public (add-funds
  (delegate principal)
  (additional-amount uint)
)
  (match (map-get? delegations { owner: tx-sender, delegate: delegate })
    delegation (begin
      (asserts! (get active delegation) ERR_DELEGATION_NOT_FOUND)
      (asserts! (> additional-amount u0) ERR_INVALID_PARAMS)
      
      ;; Transfer additional funds to contract
      (try! (stx-transfer? additional-amount tx-sender (as-contract tx-sender)))
      
      ;; Update delegation amount
      (map-set delegations
        { owner: tx-sender, delegate: delegate }
        (merge delegation { 
          amount: (+ (get amount delegation) additional-amount)
        })
      )
      
      (ok { 
        added: additional-amount,
        new-total: (+ (get amount delegation) additional-amount),
        contract-balance: (stx-get-balance (as-contract tx-sender))
      })
    )
    ERR_DELEGATION_NOT_FOUND
  )
)

;; Delegate spends from the escrow
(define-public (spend-delegated
  (owner principal)
  (amount uint)
  (recipient principal)
)
  (begin
    ;; Check delegation is active
    (asserts! (is-delegation-active owner tx-sender) ERR_DELEGATION_EXPIRED)
    
    ;; Reset daily spending if new day
    (try! (reset-daily-if-needed owner tx-sender))
    
    ;; Get updated delegation data
    (let (
      (delegation (unwrap! 
        (map-get? delegations { owner: owner, delegate: tx-sender })
        ERR_DELEGATION_NOT_FOUND
      ))
      (available-amount (- (get amount delegation) (get spent-total delegation)))
    )
      ;; Check spending limits
      (asserts! (<= amount available-amount) ERR_INSUFFICIENT_BALANCE)
      (asserts! (<= (+ (get spent-today delegation) amount) (get daily-limit delegation)) 
        ERR_INSUFFICIENT_ALLOWANCE)
      
      ;; Transfer STX from contract to recipient
      ;; This is the key line - contract sends its own STX!
      (try! (as-contract (stx-transfer? amount tx-sender recipient)))
      
      ;; Update spending counters
      (map-set delegations
        { owner: owner, delegate: tx-sender }
        (merge delegation {
          spent-total: (+ (get spent-total delegation) amount),
          spent-today: (+ (get spent-today delegation) amount)
        })
      )
      
      (ok {
        amount-spent: amount,
        recipient: recipient,
        remaining-balance: (- available-amount amount),
        remaining-daily: (- (get daily-limit delegation) (+ (get spent-today delegation) amount)),
        contract-balance: (stx-get-balance (as-contract tx-sender))
      })
    )
  )
)

;; Owner withdraws remaining funds (after expiry or revocation)
(define-public (withdraw-remaining
  (delegate principal)
)
  (let (
    (delegation (unwrap! 
      (map-get? delegations { owner: tx-sender, delegate: delegate })
      ERR_DELEGATION_NOT_FOUND
    ))
    (remaining-amount (- (get amount delegation) (get spent-total delegation)))
  )
    ;; Check delegation is expired or revoked
    (asserts! (or 
      (not (get active delegation))
      (> stacks-block-height (get end-block delegation))
    ) ERR_NOT_AUTHORIZED)
    
    ;; Transfer remaining STX back to owner
      (if (> remaining-amount u0)
      (begin
        (try! (as-contract (stx-transfer? remaining-amount tx-sender tx-sender)))
        
        ;; Update delegation to reflect withdrawal
        (map-set delegations
          { owner: tx-sender, delegate: delegate }
          (merge delegation { 
            amount: (get spent-total delegation)  ;; Set amount to what was spent
          })
        )
        
        (ok { 
          withdrawn: remaining-amount,
          contract-balance: (stx-get-balance (as-contract tx-sender))
        })
      )
      (ok { 
        withdrawn: u0,
        contract-balance: (stx-get-balance (as-contract tx-sender))
      })
    )
  )
)

;; Revoke delegation (stops further spending)
(define-public (revoke-delegation (delegate principal))
  (match (map-get? delegations { owner: tx-sender, delegate: delegate })
    delegation (begin
      (map-set delegations
        { owner: tx-sender, delegate: delegate }
        (merge delegation { active: false })
      )
      (ok true)
    )
    ERR_DELEGATION_NOT_FOUND
  )
)

;; Extend delegation duration
(define-public (extend-delegation (delegate principal) (additional-days uint))
  (match (map-get? delegations { owner: tx-sender, delegate: delegate })
    delegation (begin
      (asserts! (get active delegation) ERR_DELEGATION_NOT_FOUND)
      (map-set delegations
        { owner: tx-sender, delegate: delegate }
        (merge delegation {
          end-block: (+ (get end-block delegation) (* additional-days BLOCKS_PER_DAY))
        })
      )
      (ok { new-expiry: (+ (get end-block delegation) (* additional-days BLOCKS_PER_DAY)) })
    )
    ERR_DELEGATION_NOT_FOUND
  )
)

;; === READ-ONLY FUNCTIONS ===

;; Get delegation details
(define-read-only (get-delegation (owner principal) (delegate principal))
  (map-get? delegations { owner: owner, delegate: delegate })
)

;; Get available spending amount
(define-read-only (get-available-amount (owner principal) (delegate principal))
  (match (map-get? delegations { owner: owner, delegate: delegate })
    delegation (- (get amount delegation) (get spent-total delegation))
    u0
  )
)

;; Get delegation status
(define-read-only (get-delegation-status (owner principal) (delegate principal))
  (match (map-get? delegations { owner: owner, delegate: delegate })
    delegation (some {
      total-amount: (get amount delegation),
      available-amount: (- (get amount delegation) (get spent-total delegation)),
      daily-limit: (get daily-limit delegation),
      spent-today: (get spent-today delegation),
      spent-total: (get spent-total delegation),
      daily-remaining: (- (get daily-limit delegation) (get spent-today delegation)),
      blocks-until-expiry: (- (get end-block delegation) stacks-block-height),
      is-active: (is-delegation-active owner delegate)
    })
    none
  )
)

;; Check if delegation is active
(define-read-only (is-delegation-valid (owner principal) (delegate principal))
  (is-delegation-active owner delegate)
)

;; Get contract's total STX balance (for debugging)
(define-read-only (get-contract-balance)
  (stx-get-balance (as-contract tx-sender))
)