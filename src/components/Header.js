function Header() {
  return (
    <header className="w-full p-6 flex justify-between items-center">
      <h1 className="text-3xl font-bold gradient-text">
        Stellar Wallet
      </h1>

      <div className="text-sm text-gray-400">
        Testnet dApp
      </div>
    </header>
  );
}

export default Header;