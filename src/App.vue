<template>
  <div>
    <h1>Enviar Tezos</h1>
    <div>
      <label>Dirección de destino:</label>
      <input v-model="destinationAddress" placeholder="Ingrese la dirección" />
    </div>
    <div>
      <label>Monto (XTZ):</label>
      <input v-model="amount" placeholder="Ingrese el monto" type="number" />
    </div>
    <button @click="connectWallet">Conectar Wallet</button>
    <button @click="sendTezos">Enviar Tezos</button>
    <p>Dirección conectada: {{ walletAddress }}</p>
    <p>Transacción Hash: {{ transactionHash }}</p>
  </div>
</template>

<script>
import { TempleWallet } from "@temple-wallet/dapp";

export default {
  data() {
    return {
      wallet: null,
      tezos: null,
      walletAddress: null,
      destinationAddress: '',
      amount: 0,
      transactionHash: null,
    };
  },
  methods: {
    async connectWallet() {
      try {
        const available = await TempleWallet.isAvailable();
        if (!available) {
          throw new Error("Temple Wallet no está instalado");
        }

        // Crear instancia de TempleWallet
        this.wallet = new TempleWallet("Mi DApp");
        
        // Conectar al wallet
        await this.wallet.connect("ghostnet"); // Cambia a "ghostnet" para pruebas
        
        // Obtener una instancia de Tezos conectada al wallet
        this.tezos = this.wallet.toTezos();

        // Obtener la dirección de la cuenta
        const accountPkh = await this.tezos.wallet.pkh();
        this.walletAddress = accountPkh;
        console.info(`Dirección conectada: ${accountPkh}`);
      } catch (err) {
        console.error('Error al conectar la wallet:', err);
      }
    },
    async sendTezos() {
      try {
        // Verificar si el wallet está conectado
        if (!this.wallet || !this.wallet.connected) {
          throw new Error("Temple Wallet no está conectado. Conéctalo primero.");
        }

        const amountInTezos = parseFloat(this.amount);
        
        // Realizar la transacción
        const operation = await this.tezos.wallet.transfer({
          to: this.destinationAddress,
          amount: amountInTezos,
        }).send();

        // Esperar la confirmación
        await operation.confirmation();
        this.transactionHash = operation.opHash;
        console.info(`Transacción exitosa: ${this.transactionHash}`);
      } catch (err) {
        console.error('Error al enviar Tezos:', err);
      }
    },
  },
};
</script>
