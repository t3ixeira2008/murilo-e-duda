// ======================================================
// MURILO & DUDA
// Nosso diário de memórias
// Início do namoro: 10/07/2026
// ======================================================


const INICIO_NAMORO = new Date(2026, 6, 10, 0, 0, 0);


// ======================================================
// CONTADOR
// ======================================================

function atualizarContador() {

    const agora = new Date();

    let diferenca = agora - INICIO_NAMORO;

    if (diferenca < 0) {
        diferenca = 0;
    }

    const segundosTotais =
        Math.floor(diferenca / 1000);

    const dias =
        Math.floor(segundosTotais / 86400);

    const horas =
        Math.floor(
            (segundosTotais % 86400) / 3600
        );

    const minutos =
        Math.floor(
            (segundosTotais % 3600) / 60
        );

    const segundos =
        segundosTotais % 60;


    document.getElementById("dias")
        .textContent = dias;

    document.getElementById("horas")
        .textContent =
        String(horas).padStart(2,"0");

    document.getElementById("minutos")
        .textContent =
        String(minutos).padStart(2,"0");

    document.getElementById("segundos")
        .textContent =
        String(segundos).padStart(2,"0");
}


atualizarContador();

setInterval(
    atualizarContador,
    1000
);


// ======================================================
// BANCO DE DADOS DO NAVEGADOR
// IndexedDB
// ======================================================

let banco;

let memoriaEditando = null;

let fotosAnteriores = [];


const requisicao =
    indexedDB.open(
        "MuriloDudaDiario",
        1
    );


requisicao.onupgradeneeded = function(evento) {

    banco =
        evento.target.result;

    if (
        !banco.objectStoreNames
            .contains("memorias")
    ) {

        banco.createObjectStore(
            "memorias",
            {
                keyPath: "id",
                autoIncrement: true
            }
        );

    }

};


requisicao.onsuccess = function(evento) {

    banco =
        evento.target.result;

    mostrarMemorias();

};


requisicao.onerror = function() {

    alert(
        "Não foi possível abrir o diário."
    );

};


// ======================================================
// ELEMENTOS
// ======================================================

const form =
    document.getElementById(
        "formMemoria"
    );

const campoData =
    document.getElementById("data");

const campoTitulo =
    document.getElementById("titulo");

const campoTexto =
    document.getElementById("texto");

const campoFotos =
    document.getElementById("fotos");

const fotosInfo =
    document.getElementById("fotosInfo");

const botaoSalvar =
    document.getElementById("salvar");

const botaoCancelar =
    document.getElementById(
        "cancelarEdicao"
    );


// Coloca automaticamente a data de hoje

const hoje = new Date();

campoData.value =
    `${hoje.getFullYear()}-${
        String(
            hoje.getMonth() + 1
        ).padStart(2,"0")
    }-${
        String(
            hoje.getDate()
        ).padStart(2,"0")
    }`;


// ======================================================
// FOTOS
// ======================================================

campoFotos.addEventListener(
    "change",
    () => {

        const quantidade =
            campoFotos.files.length;

        if (quantidade > 0) {

            fotosInfo.textContent =
                quantidade === 1
                ? "1 foto selecionada."
                : `${quantidade} fotos selecionadas.`;

        } else {

            fotosInfo.textContent = "";

        }

    }
);


function arquivoParaBase64(arquivo) {

    return new Promise(
        (resolve,reject) => {

            const leitor =
                new FileReader();

            leitor.onload =
                () => resolve(
                    leitor.result
                );

            leitor.onerror =
                reject;

            leitor.readAsDataURL(
                arquivo
            );

        }
    );

}


async function converterFotos() {

    const arquivos =
        Array.from(
            campoFotos.files
        );

    const fotos = [];

    for (
        const arquivo of arquivos
    ) {

        const foto =
            await arquivoParaBase64(
                arquivo
            );

        fotos.push(foto);

    }

    return fotos;

}


// ======================================================
// SALVAR
// ======================================================

form.addEventListener(
    "submit",
    async function(evento) {

        evento.preventDefault();


        const novasFotos =
            await converterFotos();


        let todasFotos =
            [
                ...fotosAnteriores,
                ...novasFotos
            ];


        const memoria = {

            data:
                campoData.value,

            titulo:
                campoTitulo.value.trim(),

            texto:
                campoTexto.value.trim(),

            fotos:
                todasFotos,

            criadoEm:
                new Date()
                    .toISOString()

        };


        const transacao =
            banco.transaction(
                ["memorias"],
                "readwrite"
            );


        const store =
            transacao.objectStore(
                "memorias"
            );


        if (memoriaEditando) {

            memoria.id =
                memoriaEditando;

            store.put(memoria);

        } else {

            store.add(memoria);

        }


        transacao.oncomplete =
            function() {

                limparFormulario();

                mostrarMemorias();

            };

    }
);


// ======================================================
// LISTAR MEMÓRIAS
// ======================================================

function mostrarMemorias() {

    const transacao =
        banco.transaction(
            ["memorias"],
            "readonly"
        );


    const store =
        transacao.objectStore(
            "memorias"
        );


    const requisicao =
        store.getAll();


    requisicao.onsuccess =
        function() {

            const memorias =
                requisicao.result;


            memorias.sort(
                (a,b) =>
                    new Date(b.data)
                    -
                    new Date(a.data)
            );


            desenharMemorias(
                memorias
            );

        };

}


function desenharMemorias(
    memorias
) {

    const lista =
        document.getElementById(
            "listaMemorias"
        );

    const vazio =
        document.getElementById(
            "semMemorias"
        );


    lista.innerHTML = "";


    if (
        memorias.length === 0
    ) {

        vazio.style.display =
            "block";

        return;

    }


    vazio.style.display =
        "none";


    memorias.forEach(
        memoria => {

            const artigo =
                document.createElement(
                    "article"
                );


            artigo.className =
                "memoria";


            let fotosHTML = "";


            if (
                memoria.fotos &&
                memoria.fotos.length
            ) {

                const classe =
                    memoria.fotos.length === 1
                    ? "grade-fotos uma"
                    : "grade-fotos";


                fotosHTML =
                    `<div class="${classe}">`;


                memoria.fotos.forEach(
                    foto => {

                        fotosHTML += `
                            <img
                                src="${foto}"
                                class="foto-memoria"
                                alt="Memória de Murilo e Duda"
                            >
                        `;

                    }
                );


                fotosHTML += "</div>";

            }


            artigo.innerHTML = `

                ${fotosHTML}

                <div class="memoria-conteudo">

                    <div class="memoria-data">
                        ${formatarData(
                            memoria.data
                        )}
                    </div>

                    <h3>
                        ${escaparHTML(
                            memoria.titulo
                        )}
                    </h3>

                    <p class="memoria-texto">
                        ${escaparHTML(
                            memoria.texto
                        )}
                    </p>

                </div>

                <div class="acoes">

                    <button
                        class="editar"
                        data-id="${memoria.id}"
                    >
                        ✎ Editar
                    </button>

                    <button
                        class="excluir"
                        data-id="${memoria.id}"
                    >
                        ♡ Excluir
                    </button>

                </div>

            `;


            lista.appendChild(
                artigo
            );

        }
    );


    configurarBotoes();

    configurarFotos();

}


// ======================================================
// DATA
// ======================================================

function formatarData(data) {

    if (!data)
        return "";


    const partes =
        data.split("-");


    const dataLocal =
        new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );


    return dataLocal
        .toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

}


// ======================================================
// EVITAR HTML DIGITADO
// ======================================================

function escaparHTML(texto) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        texto;

    return div.innerHTML;

}


// ======================================================
// EDITAR / EXCLUIR
// ======================================================

function configurarBotoes() {

    document
        .querySelectorAll(
            ".excluir"
        )
        .forEach(
            botao => {

                botao.onclick =
                    () =>
                        excluirMemoria(
                            Number(
                                botao.dataset.id
                            )
                        );

            }
        );


    document
        .querySelectorAll(
            ".editar"
        )
        .forEach(
            botao => {

                botao.onclick =
                    () =>
                        editarMemoria(
                            Number(
                                botao.dataset.id
                            )
                        );

            }
        );

}


function excluirMemoria(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir essa memória?"
        );


    if (!confirmar)
        return;


    const transacao =
        banco.transaction(
            ["memorias"],
            "readwrite"
        );


    transacao
        .objectStore("memorias")
        .delete(id);


    transacao.oncomplete =
        mostrarMemorias;

}


function editarMemoria(id) {

    const transacao =
        banco.transaction(
            ["memorias"],
            "readonly"
        );


    const requisicao =
        transacao
            .objectStore(
                "memorias"
            )
            .get(id);


    requisicao.onsuccess =
        function() {

            const memoria =
                requisicao.result;


            memoriaEditando =
                memoria.id;


            fotosAnteriores =
                memoria.fotos || [];


            campoData.value =
                memoria.data;

            campoTitulo.value =
                memoria.titulo;

            campoTexto.value =
                memoria.texto;


            document
                .getElementById(
                    "tituloFormulario"
                )
                .textContent =
                "Editar memória 💗";


            botaoSalvar.textContent =
                "♥ Salvar alterações";


            botaoCancelar
                .classList
                .remove(
                    "escondido"
                );


            if (
                fotosAnteriores.length
            ) {

                fotosInfo.textContent =
                    `${fotosAnteriores.length} foto(s) já salvas. Você pode adicionar mais.`;

            }


            document
                .getElementById(
                    "diario"
                )
                .scrollIntoView(
                    {
                        behavior:
                            "smooth"
                    }
                );

        };

}


// ======================================================
// CANCELAR EDIÇÃO
// ======================================================

botaoCancelar.addEventListener(
    "click",
    limparFormulario
);


function limparFormulario() {

    form.reset();

    memoriaEditando = null;

    fotosAnteriores = [];

    fotosInfo.textContent = "";


    document
        .getElementById(
            "tituloFormulario"
        )
        .textContent =
        "Criar uma nova memória 💕";


    botaoSalvar.textContent =
        "♥ Guardar memória";


    botaoCancelar
        .classList
        .add(
            "escondido"
        );


    const agora =
        new Date();


    campoData.value =
        `${agora.getFullYear()}-${
            String(
                agora.getMonth() + 1
            ).padStart(2,"0")
        }-${
            String(
                agora.getDate()
            ).padStart(2,"0")
        }`;

}


// ======================================================
// VISUALIZAR FOTO
// ======================================================

function configurarFotos() {

    document
        .querySelectorAll(
            ".foto-memoria"
        )
        .forEach(
            imagem => {

                imagem.onclick =
                    function() {

                        document
                            .getElementById(
                                "fotoGrande"
                            )
                            .src =
                            imagem.src;


                        document
                            .getElementById(
                                "visualizador"
                            )
                            .classList
                            .add(
                                "aberto"
                            );

                    };

            }
        );

}


document
    .getElementById(
        "fecharFoto"
    )
    .onclick =
    function() {

        document
            .getElementById(
                "visualizador"
            )
            .classList
            .remove(
                "aberto"
            );

    };


// ======================================================
// BACKUP
// ======================================================

document
    .getElementById(
        "exportar"
    )
    .onclick =
    function() {

        const transacao =
            banco.transaction(
                ["memorias"],
                "readonly"
            );


        const requisicao =
            transacao
                .objectStore(
                    "memorias"
                )
                .getAll();


        requisicao.onsuccess =
            function() {

                const dados =
                    JSON.stringify(
                        requisicao.result,
                        null,
                        2
                    );


                const arquivo =
                    new Blob(
                        [dados],
                        {
                            type:
                                "application/json"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        arquivo
                    );


                const link =
                    document
                        .createElement(
                            "a"
                        );


                link.href =
                    url;


                link.download =
                    "backup-murilo-duda.json";


                link.click();


                URL.revokeObjectURL(
                    url
                );

            };

    };


// ======================================================
// RESTAURAR BACKUP
// ======================================================

document
    .getElementById(
        "importarArquivo"
    )
    .addEventListener(
        "change",
        function(evento) {

            const arquivo =
                evento.target
                    .files[0];


            if (!arquivo)
                return;


            const leitor =
                new FileReader();


            leitor.onload =
                function() {

                    try {

                        const dados =
                            JSON.parse(
                                leitor.result
                            );


                        if (
                            !Array.isArray(
                                dados
                            )
                        ) {

                            throw new Error();

                        }


                        const confirmar =
                            confirm(
                                "Restaurar este backup? As memórias atuais serão substituídas."
                            );


                        if (!confirmar)
                            return;


                        restaurarBackup(
                            dados
                        );

                    }

                    catch {

                        alert(
                            "Esse arquivo de backup não é válido."
                        );

                    }

                };


            leitor.readAsText(
                arquivo
            );

        }
    );


function restaurarBackup(
    memorias
) {

    const transacao =
        banco.transaction(
            ["memorias"],
            "readwrite"
        );


    const store =
        transacao.objectStore(
            "memorias"
        );


    store.clear();


    memorias.forEach(
        memoria => {

            store.put(
                memoria
            );

        }
    );


    transacao.oncomplete =
        function() {

            alert(
                "Backup restaurado com sucesso! 💗"
            );

            mostrarMemorias();

        };

}
