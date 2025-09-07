;; multisig-wallet.clar
;; Multi-signature wallet with pooled funds and approval-based transfers
;; Based on Stacks/Clarity patterns with threshold signatures

;; === ERROR CODES ===
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_INVALID_THRESHOLD (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))
(define-constant ERR_TRANSACTION_NOT_FOUND (err u103))
(define-constant ERR_ALREADY_APPROVED (err u104))
(define-constant ERR_TRANSACTION_EXECUTED (err u105))
(define-constant ERR_INSUFFICIENT_APPROVALS (err u106))
(define-constant ERR_INVALID_OWNER (err u107))
(define-constant ERR_OWNER_EXISTS (err u108))
(define-constant ERR_CANNOT_REMOVE_SELF (err u109))
(define-constant ERR_TRANSACTION_EXPIRED (err u110))

;; === CONSTANTS ===
(define-constant MAX_OWNERS u10)
(define-constant DEFAULT_EXPIRY_BLOCKS u4320) ;; ~30 days

;; === DATA VARIABLES ===
(define-data-var owners-count uint u0)
(define-data-var approval-threshold uint u2)
(define-data-var transaction-nonce uint u0)

;; === DATA MAPS ===

;; Track wallet owners
(define-map owners
  { owner: principal }
  { added-at: uint, active: bool }
)

;; Pending transactions requiring approval
(define-map transactions
  { tx-id: uint }
  {
    proposer: principal,
    recipient: principal,
    amount: uint,
    memo: (optional (buff 34)),
    approvals: uint,
    executed: bool,
    created-at: uint,
    expires-at: uint
  }
)

;; Track individual approvals for each transaction
(define-map approvals
  { tx-id: uint, owner: principal }
  { approved: bool, approved-at: uint }
)

;; === PRIVATE FUNCTIONS ===

;; Check if caller is an owner
(define-private (is-owner (user principal))
  (match (map-get? owners { owner: user })
    owner-info (get active owner-info)
    false
  )
)

;; Get next transaction ID
(define-private (get-next-tx-id)
  (let ((current-nonce (var-get transaction-nonce)))
    (var-set transaction-nonce (+ current-nonce u1))
    (+ current-nonce u1)
  )
)

;; Check if transaction has enough approvals
(define-private (has-enough-approvals (tx-id uint))
  (match (map-get? transactions { tx-id: tx-id })
    tx-info (>= (get approvals tx-info) (var-get approval-threshold))
    false
  )
)

;; Check if transaction is still valid (not expired)
(define-private (is-transaction-valid (tx-id uint))
  (match (map-get? transactions { tx-id: tx-id })
    tx-info (and
      (not (get executed tx-info))
      (<= stacks-block-height (get expires-at tx-info))
    )
    false
  )
)

;; === INITIALIZATION ===

;; Initialize multisig wallet with initial owners and threshold
(define-public (initialize
  (initial-owners (list 10 principal))
  (required-approvals uint)
)
  (begin
    ;; Only allow initialization if no owners exist
    (asserts! (is-eq (var-get owners-count) u0) (err u200))
    
    ;; Validate threshold
    (asserts! (> required-approvals u0) ERR_INVALID_THRESHOLD)
    (asserts! (<= required-approvals (len initial-owners)) ERR_INVALID_THRESHOLD)
    (asserts! (<= (len initial-owners) MAX_OWNERS) ERR_INVALID_THRESHOLD)
    
    ;; Set threshold
    (var-set approval-threshold required-approvals)
    
    ;; Add initial owners
    (try! (add-owners-bulk initial-owners))
    
    (ok {
      owners-added: (len initial-owners),
      threshold: required-approvals,
      contract-balance: (stx-get-balance (as-contract tx-sender))
    })
  )
)

;; Bulk add owners (private helper)
(define-private (add-owners-bulk (new-owners (list 10 principal)))
  (fold add-single-owner new-owners (ok true))
)

(define-private (add-single-owner (owner principal) (result (response bool uint)))
  (match result
    success (begin
      (map-set owners
        { owner: owner }
        { added-at: stacks-block-height, active: true }
      )
      (var-set owners-count (+ (var-get owners-count) u1))
      (ok true)
    )
    error (err error)
  )
)

;; === DEPOSIT FUNCTIONS ===

;; Deposit STX to the multisig wallet
(define-public (deposit (amount uint))
  (begin
    (asserts! (> amount u0) ERR_INSUFFICIENT_BALANCE)
    
    ;; Transfer STX to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    (ok {
      deposited: amount,
      depositor: tx-sender,
      new-balance: (stx-get-balance (as-contract tx-sender))
    })
  )
)

;; === TRANSACTION MANAGEMENT ===

;; Propose a new transaction
(define-public (propose-transaction
  (recipient principal)
  (amount uint)
  (memo (optional (buff 34)))
)
  (let ((tx-id (get-next-tx-id)))
    ;; Only owners can propose transactions
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    (asserts! (> amount u0) ERR_INSUFFICIENT_BALANCE)
    
    ;; Check contract has sufficient balance
    (asserts! (<= amount (stx-get-balance (as-contract tx-sender))) ERR_INSUFFICIENT_BALANCE)
    
    ;; Create transaction
    (map-set transactions
      { tx-id: tx-id }
      {
        proposer: tx-sender,
        recipient: recipient,
        amount: amount,
        memo: memo,
        approvals: u1, ;; Proposer automatically approves
        executed: false,
        created-at: stacks-block-height,
        expires-at: (+ stacks-block-height DEFAULT_EXPIRY_BLOCKS)
      }
    )
    
    ;; Record proposer's approval
    (map-set approvals
      { tx-id: tx-id, owner: tx-sender }
      { approved: true, approved-at: stacks-block-height }
    )
    
    (ok {
      tx-id: tx-id,
      recipient: recipient,
      amount: amount,
      approvals-needed: (- (var-get approval-threshold) u1),
      expires-at: (+ stacks-block-height DEFAULT_EXPIRY_BLOCKS)
    })
  )
)

;; Approve a pending transaction
(define-public (approve-transaction (tx-id uint))
  (begin
    ;; Only owners can approve
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    
    ;; Check transaction exists and is valid
    (asserts! (is-transaction-valid tx-id) ERR_TRANSACTION_NOT_FOUND)
    
    ;; Check not already approved by this owner
    (asserts! (is-none (map-get? approvals { tx-id: tx-id, owner: tx-sender })) 
      ERR_ALREADY_APPROVED)
    
    ;; Get current transaction info
    (let ((tx-info (unwrap! (map-get? transactions { tx-id: tx-id }) ERR_TRANSACTION_NOT_FOUND)))
      
      ;; Record approval
      (map-set approvals
        { tx-id: tx-id, owner: tx-sender }
        { approved: true, approved-at: stacks-block-height }
      )
      
      ;; Update approval count
      (map-set transactions
        { tx-id: tx-id }
        (merge tx-info { approvals: (+ (get approvals tx-info) u1) })
      )
      
      (ok {
        tx-id: tx-id,
        approvals: (+ (get approvals tx-info) u1),
        approvals-needed: (- (var-get approval-threshold) (+ (get approvals tx-info) u1)),
        ready-to-execute: (>= (+ (get approvals tx-info) u1) (var-get approval-threshold))
      })
    )
  )
)

;; Execute approved transaction
(define-public (execute-transaction (tx-id uint))
  (begin
    ;; Only owners can execute
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    
    ;; Check transaction exists and is valid
    (asserts! (is-transaction-valid tx-id) ERR_TRANSACTION_NOT_FOUND)
    
    ;; Check has enough approvals
    (asserts! (has-enough-approvals tx-id) ERR_INSUFFICIENT_APPROVALS)
    
    ;; Get transaction info
    (let ((tx-info (unwrap! (map-get? transactions { tx-id: tx-id }) ERR_TRANSACTION_NOT_FOUND)))
      
      ;; Check not already executed
      (asserts! (not (get executed tx-info)) ERR_TRANSACTION_EXECUTED)
      
      ;; Execute the transfer
      (try! (as-contract (stx-transfer? (get amount tx-info) tx-sender (get recipient tx-info))))
      
      ;; Mark as executed
      (map-set transactions
        { tx-id: tx-id }
        (merge tx-info { executed: true })
      )
      
      (ok {
        tx-id: tx-id,
        recipient: (get recipient tx-info),
        amount: (get amount tx-info),
        executed-by: tx-sender,
        remaining-balance: (stx-get-balance (as-contract tx-sender))
      })
    )
  )
)

;; === OWNER MANAGEMENT ===

;; Add new owner (requires multisig approval)
(define-public (add-owner (new-owner principal))
  (begin
    ;; Only owners can propose
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    
    ;; Check owner doesn't already exist
    (asserts! (not (is-owner new-owner)) ERR_OWNER_EXISTS)
    
    ;; Check max owners limit
    (asserts! (< (var-get owners-count) MAX_OWNERS) ERR_INVALID_THRESHOLD)
    
    ;; Add owner
    (map-set owners
      { owner: new-owner }
      { added-at: stacks-block-height, active: true }
    )
    
    (var-set owners-count (+ (var-get owners-count) u1))
    
    (ok {
      new-owner: new-owner,
      total-owners: (var-get owners-count)
    })
  )
)

;; Remove owner (requires multisig approval) 
(define-public (remove-owner (owner-to-remove principal))
  (begin
    ;; Only owners can propose
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    
    ;; Cannot remove self (prevents lockout)
    (asserts! (not (is-eq tx-sender owner-to-remove)) ERR_CANNOT_REMOVE_SELF)
    
    ;; Check owner exists
    (asserts! (is-owner owner-to-remove) ERR_INVALID_OWNER)
    
    ;; Ensure threshold still achievable after removal
    (asserts! (> (- (var-get owners-count) u1) u0) ERR_INVALID_THRESHOLD)
    (asserts! (<= (var-get approval-threshold) (- (var-get owners-count) u1)) ERR_INVALID_THRESHOLD)
    
    ;; Remove owner
    (map-delete owners { owner: owner-to-remove })
    (var-set owners-count (- (var-get owners-count) u1))
    
    (ok {
      removed-owner: owner-to-remove,
      total-owners: (var-get owners-count)
    })
  )
)

;; Change approval threshold (requires multisig approval)
(define-public (change-threshold (new-threshold uint))
  (begin
    ;; Only owners can propose
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    
    ;; Validate new threshold
    (asserts! (> new-threshold u0) ERR_INVALID_THRESHOLD)
    (asserts! (<= new-threshold (var-get owners-count)) ERR_INVALID_THRESHOLD)
    
    ;; Set new threshold
    (var-set approval-threshold new-threshold)
    
    (ok {
      old-threshold: (var-get approval-threshold),
      new-threshold: new-threshold
    })
  )
)

;; === READ-ONLY FUNCTIONS ===

;; Get wallet info
(define-read-only (get-wallet-info)
  {
    owners-count: (var-get owners-count),
    approval-threshold: (var-get approval-threshold),
    balance: (stx-get-balance (as-contract tx-sender)),
    transaction-nonce: (var-get transaction-nonce)
  }
)

;; Get transaction details
(define-read-only (get-transaction (tx-id uint))
  (map-get? transactions { tx-id: tx-id })
)

;; Check if user is owner
(define-read-only (check-is-owner (user principal))
  (is-owner user)
)

;; Get owner info
(define-read-only (get-owner-info (owner principal))
  (map-get? owners { owner: owner })
)

;; Get approval status for transaction
(define-read-only (get-approval-status (tx-id uint) (owner principal))
  (map-get? approvals { tx-id: tx-id, owner: owner })
)

;; Check if transaction can be executed
(define-read-only (can-execute-transaction (tx-id uint))
  (and
    (is-transaction-valid tx-id)
    (has-enough-approvals tx-id)
  )
)

;; Get contract balance
(define-read-only (get-balance)
  (stx-get-balance (as-contract tx-sender))
)