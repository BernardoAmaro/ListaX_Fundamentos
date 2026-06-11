const { performance } = require('perf_hooks');

// --- IMPLEMENTAÇÃO DOS ALGORITMOS ---

// 1. Insertion Sort (Conta movimentações)
function insertionSort(arr) {
    let moves = 0;
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            moves++; // Deslocou elemento
            j--;
        }
        arr[j + 1] = key;
        moves++; // Inseriu a chave
    }
    return moves;
}

// 2. Merge Sort (Conta movimentações de cópia para arrays)
function mergeSort(arr) {
    let moves = 0;
    
    function merge(esq, dir) {
        let resultado = [];
        let i = 0, j = 0;
        while (i < esq.length && j < dir.length) {
            moves++;
            if (esq[i] < dir[j]) resultado.push(esq[i++]);
            else resultado.push(dir[j++]);
        }
        while(i < esq.length) { moves++; resultado.push(esq[i++]); }
        while(j < dir.length) { moves++; resultado.push(dir[j++]); }
        return resultado;
    }
    
    function sort(array) {
        if (array.length <= 1) return array;
        let meio = Math.floor(array.length / 2);
        let esq = sort(array.slice(0, meio));
        let dir = sort(array.slice(meio));
        return merge(esq, dir);
    }
    
    sort(arr);
    return moves;
}

// 3. Quick Sort (Conta trocas na partição)
function quickSort(arr, low = 0, high = arr.length - 1, counter = { swaps: 0 }) {
    if (low < high) {
        let pivotIndex = partition(arr, low, high, counter);
        quickSort(arr, low, pivotIndex - 1, counter);
        quickSort(arr, pivotIndex + 1, high, counter);
    }
    return counter.swaps;
}

function partition(arr, low, high, counter) {
    let pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Troca
            counter.swaps++;
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; // Troca do pivot
    counter.swaps++;
    return i + 1;
}

// --- FUNÇÕES UTILITÁRIAS PARA TESTES ---

function calcularMedia(valores) {
    return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function calcularDesvioPadrao(valores, media) {
    const variancia = valores.reduce((a, b) => a + Math.pow(b - media, 2), 0) / valores.length;
    return Math.sqrt(variancia);
}

function gerarVetorAleatorio(tamanho) {
    return Array.from({ length: tamanho }, () => Math.floor(Math.random() * tamanho * 10));
}

// --- EXECUÇÃO DO EXPERIMENTO ---
const tamanhos = [1000, 10000, 100000];
const resultados = [];

console.log("Iniciando testes... Isso pode levar alguns segundos.\n");

tamanhos.forEach(tamanho => {
    // Para cada tamanho, o mesmo vetor original deve ser usado (regra da atividade)
    const vetorOriginal = gerarVetorAleatorio(tamanho);

    const algoritmos = [
        { nome: 'Insertion Sort', complexidade: 'O(n^2)', func: (arr) => insertionSort(arr) },
        { nome: 'Merge Sort', complexidade: 'O(n log n)', func: (arr) => mergeSort(arr) },
        { nome: 'Quick Sort', complexidade: 'O(n log n)', func: (arr) => quickSort(arr) }
    ];

    algoritmos.forEach(alg => {
        let tempos = [];
        let movimentacoes = 0;

        for (let exec = 1; exec <= 3; exec++) {
            // Copia o vetor original para não ordenar um vetor já ordenado
            let vetorTeste = [...vetorOriginal]; 
            
            let inicio = performance.now();
            let operacoesExecucao = alg.func(vetorTeste);
            let fim = performance.now();
            
            tempos.push((fim - inicio) / 1000); // Converte para segundos
            
            // Pega as operações da última execução (são as mesmas para o mesmo vetor inicial)
            if (exec === 3) movimentacoes = operacoesExecucao;
        }

        let media = calcularMedia(tempos);
        let desvio = calcularDesvioPadrao(tempos, media);

        resultados.push({
            Algoritmo: alg.nome,
            Complexidade: alg.complexidade,
            Tamanho: tamanho,
            Exec1: tempos[0].toFixed(6),
            Exec2: tempos[1].toFixed(6),
            Exec3: tempos[2].toFixed(6),
            Media: media.toFixed(6),
            Desvio: desvio.toFixed(6),
            Movimentacoes: movimentacoes
        });
    });
});

// Imprimindo em formato CSV para facilitar cópia para a planilha Excel
console.log("Algoritmo;Complexidade no caso médio;Tamanho do vetor;Execução 1 (s);Execução 2 (s);Execução 3 (s);Tempo médio (s);Desvio padrão (s);Trocas ou movimentações");
resultados.forEach(r => {
    console.log(`${r.Algoritmo};${r.Complexidade};${r.Tamanho};${r.Exec1};${r.Exec2};${r.Exec3};${r.Media};${r.Desvio};${r.Movimentacoes}`);
});
