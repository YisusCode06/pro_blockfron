<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { TempleWallet } from "@temple-wallet/dapp";

const emit = defineEmits(); // Definir emit
const wallet = ref(null);
const tezos = ref(null);
const balance = ref(0); // Estado para almacenar el saldo

// Conectar la wallet de Temple
const connectWallet = async () => {
    try {
        const available = await TempleWallet.isAvailable();
        if (!available) {
            throw new Error("Temple Wallet no está instalado");
        }

        wallet.value = new TempleWallet("Mi DApp");
        await wallet.value.connect("ghostnet");
        tezos.value = wallet.value.toTezos();
        const walletAddress = await tezos.value.wallet.pkh();
        console.info(`Dirección conectada: ${walletAddress}`);

        // Obtener el saldo después de conectar
        await getWalletBalance();
    } catch (err) {
        console.error('Error al conectar la wallet:', err);
    }
};

// Función para obtener el saldo de la wallet
const getWalletBalance = async () => {
    if (!tezos.value || !tezos.value.wallet) {
        console.error("Wallet no está conectada.");
        return;
    }
    
    try {
        const walletAddress = await tezos.value.wallet.pkh(); // Obtener la dirección de la wallet conectada
        const balanceInMutez = await tezos.value.tz.getBalance(walletAddress); // Obtener el saldo en mutez
        const balanceInTez = balanceInMutez / 1000000; // Convertir a tez

        console.log(`El saldo de la wallet ${walletAddress} es: ${balanceInTez} XTZ`);
        balance.value = balanceInTez; // Almacenar el saldo en el estado

        // Emitir el saldo al componente padre
        emit('balance-updated', balance.value);
    } catch (error) {
        console.error('Error al obtener el saldo:', error);
    }
};

// Conectar automáticamente la wallet al montar el componente
onMounted(() => {
    connectWallet();
});
</script>

<template>
    <div class="container m-2 w-25">
        <div class="card text-center p-2">
            <h1 class="card-title">Saldo:</h1>
            <p class="card-text">{{ balance }} XTZ</p> <!-- Mostrar el saldo en el template -->
        </div>
    </div>
</template>

<style scoped>
.card {
    background-color: #f8f9fa; /* Fondo claro */
    border: 1px solid #ced4da; /* Borde gris */
    border-radius: 10px; /* Esquinas redondeadas */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra sutil */
}
</style>
