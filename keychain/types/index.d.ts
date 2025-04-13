export {};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    solana: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}