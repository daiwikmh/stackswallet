# Programmable Multi-Sig Wallet Platform

A comprehensive platform for managing programmable multi-signature wallets on the Stacks blockchain with AI agent automation, delegation management, and collaborative expense sharing.

## 🚀 Features

### Multi-Signature Operations
- **Configurable Thresholds**: Create wallets with custom approval requirements (2/3, 3/5, etc.)
- **Transaction Proposals**: Propose and approve STX transfers with multi-party consent
- **Owner Management**: Add/remove wallet owners dynamically
- **Security**: Built-in safeguards and approval workflows

### AI Agent Delegation
- **Autonomous Agents**: Create AI agents with their own Stacks wallets
- **Budget Constraints**: Set daily limits and spending rules for agents
- **Automated Transactions**: Agents can propose and execute transactions within defined parameters
- **LangChain Integration**: Powered by advanced language models for intelligent decision-making

### Expense Sharing (Splitwise-style)
- **Shared Expenses**: Record and track group expenses automatically
- **Debt Settlement**: Automatically settle debts through multi-sig execution
- **Collaborative Management**: Multiple users can manage shared financial obligations

### Stacks Blockchain Integration
- **Native STX Support**: Handle Stacks (STX) transfers and wallet operations
- **Clarity Smart Contracts**: Interact with deployed contracts on Stacks testnet
- **Real-time Updates**: Live blockchain state synchronization

## 📋 Smart Contracts

The platform uses two main smart contracts deployed on Stacks testnet:

- **Multi-Sig Contract**: `ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.multisig`
- **Delegation Contract**: `ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.delegation`

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom components
- **Blockchain**: Stacks.js SDK for Stacks blockchain interaction
- **AI/ML**: LangChain with OpenRouter API integration
- **State Management**: React Context API
- **UI Components**: Custom component library with Shadcn/ui

## 🏗 Architecture

### Agent System
- **Manual Agents**: User-created agents with custom names and wallets
- **Agent Context**: Centralized state management for all agent operations
- **Streaming Chat**: Real-time conversations with AI agents
- **Error Handling**: Comprehensive error boundaries and fallback mechanisms

### Multi-Sig Workflow
1. **Initialize Wallet** - Set up owners and approval threshold
2. **Deposit Funds** - Add STX to the shared wallet
3. **Propose Transaction** - Submit transfer proposals
4. **Approve Transaction** - Collect required approvals
5. **Execute Transaction** - Automatically execute when threshold is met

### Delegation Workflow
1. **Create Delegation** - Set up agent with budget and limits
2. **Deposit Funds** - Escrow STX for agent operations
3. **Agent Operations** - AI makes autonomous transactions within limits
4. **Monitor & Control** - Track spending and revoke if needed

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Stacks wallet (Hiro Wallet recommended)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd stacks-client
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Configure your environment variables:
```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

4. Start the development server
```bash
npm run dev
```

5. Connect your Stacks wallet and start creating multi-sig wallets and AI agents!

## 📱 Usage

### Creating Multi-Sig Wallets
1. Navigate to the Multi-Sig section
2. Set up initial owners and approval threshold
3. Deposit STX into the wallet
4. Propose and approve transactions collaboratively

### Setting Up AI Agents
1. Go to Manual Agent Control
2. Create a new agent with a custom name
3. Fund the agent with STX for gas fees
4. Chat with your agent in the AI Chat section
5. Agents can perform multi-sig operations autonomously

### Managing Delegations
1. Create delegation relationships between wallets and agents
2. Set daily spending limits and duration
3. Monitor agent spending in real-time
4. Revoke or extend delegations as needed

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── agent/              # AI agent components
│   │   ├── manual/         # Manual agent management
│   │   └── page.tsx        # Main chat interface
│   ├── landing/            # Landing page components
│   └── ui/                 # Reusable UI components
├── agent/                  # LangChain agent implementation
├── contexts/               # React contexts
└── lib/                    # Utility functions
```

### Key Components
- **Agent Chat Interface**: Real-time streaming conversations with AI agents
- **Multi-Sig Management**: Complete multi-signature wallet operations
- **Delegation System**: AI agent delegation and spending controls
- **Error Boundaries**: Robust error handling throughout the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

[Add your license here]

## 🆘 Support

For questions and support:
- Create an issue in this repository
- Check the documentation
- Join our community discussions

---

Built with ❤️ for the Stacks ecosystem
