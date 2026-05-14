$(document).ready(function () {
  // Função para gerenciar a obrigatoriedade (Visual)
  function configurarRegraAprovacao(nomeRadio, idObservacao) {
    var seletorRadio = 'input[name="' + nomeRadio + '"]';
    var seletorLabel = 'label[for="' + idObservacao + '"]';

    function gerenciar(valor) {
      if (valor === "sim") {
        $(seletorLabel).removeClass("obrigatorio");
      } else {
        $(seletorLabel).addClass("obrigatorio");
      }
    }

    // Gatilho para mudança no Radio
    $(document).on("change", seletorRadio, function () {
      gerenciar(this.value);
    });

    // Verificação inicial ao carregar a página
    var valorMarcado = $(seletorRadio + ":checked").val();
    if (valorMarcado) {
      gerenciar(valorMarcado);
    }
  }

  // Aplica a regra para os 3 painéis existentes
  configurarRegraAprovacao("coordAprovado", "obsGestor");
  configurarRegraAprovacao("aprovCoordFinAprovado", "observacaoContrato");
  configurarRegraAprovacao(
    "coordFinanceiraAprovadoCR",
    "obsCoordenacaoFinanceira",
  );


  // --- Funções de Visibilidade ---
  function esconderPaineisTipo() {
    $("#painelInsensaoTaxaVestibular").hide();
    $("#painelSolicitacaoBolsaBeneficios").hide();
  }

  function exibirPainelTipoSelecionado() {
    var tipo = $("#TipodeSol").val();
    esconderPaineisTipo();

    if (tipo == "insensaoTaxaVestibular") {
      $("#painelInsensaoTaxaVestibular").show();
    } else if (tipo == "solicitacaoBolsaBeneficios") {
      $("#painelSolicitacaoBolsaBeneficios").show();
    }
  }

  // Função para formatar CPF enquanto o usuário digita provavelmente terá que ser migrado para o custom valida
  function formatarCpf(valor) {
    var numeros = (valor || "").replace(/\D/g, "").slice(0, 11);

    numeros = numeros.replace(/(\d{3})(\d)/, "$1.$2");
    numeros = numeros.replace(/(\d{3})(\d)/, "$1.$2");
    numeros = numeros.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    return numeros;
  }

  // Função para mostrar ou esconder os campos de dados bancários se o campo cashback for "Sim"

  function alternarDadosBancariosCashback() {
    var exibirDadosBancarios =
      ($("#possuiCashback").val() || "").toLowerCase() === "sim";

    $("#numeroBanco, #banco, #agencia, #conta, #contaPix").each(function () {
      $(this).closest(".form-group").toggle(exibirDadosBancarios);
    });
  }

  function permitirNumeros(valor) {
    return (valor || "").replace(/\D/g, "");
  }

  function permitirNumerosComHifen(valor) {
    return (valor || "")
      .replace(/[^0-9-]/g, "")
      .replace(/-{2,}/g, "-")
      .replace(/(.*)-/g, function (_match, grupo) {
        return grupo.replace(/-/g, "") + "-";
      });
  }

  $(document).on("change", "#TipodeSol", function () {
    exibirPainelTipoSelecionado();
  });

  $(document).on("click", "#btnSelecionarArquivoExcel", function () {
    $("#importarExcel").trigger("click");
  });

  $(document).on("change", "#importarExcel", function () {
    var nomeArquivo = this.files && this.files.length ? this.files[0].name : "";
    $("#nomeArquivoImportacao").val(nomeArquivo);
  });

  $(document).on("change", "#possuiCashback", function () {
    alternarDadosBancariosCashback();
  });

  $(document).on("input", "#cpfAluno", function () {
    $(this).val(formatarCpf($(this).val()));
  });

  $(document).on("input", "#numeroBanco", function () {
    $(this).val(permitirNumeros($(this).val()));
  });

  $(document).on("input", "#agencia, #conta", function () {
    $(this).val(permitirNumerosComHifen($(this).val()));
  });

  esconderPaineisTipo();
  exibirPainelTipoSelecionado();
  alternarDadosBancariosCashback();

  $(document).on("click", ".btnRemoverCandidato", function () {
    var totalLinhas = $("table[tablename='tableCandidato'] tbody tr").length;

    if (totalLinhas > 1) {
      fnWdkRemoveChild(this);
    } else {
      $(this).closest("tr").find("input, select, textarea").val("");
    }
  });

  // Lógica por tarefa (TASK)

  if (currentTask == 4 || currentTask == 0) {
    // Recupera informações de usuário e empresa,  adaptado para pegar os dados diretamente do RM e do Fluig e preencher os campos do formulário
    const mail = parent.WCMAPI.userEmail;
    const user = parent.WCMAPI.user;
    const DadosFuncRM = getDadosFunc(mail);
    const DadosFuncFluig = getUserByMail(mail);
    const coligada = getDadosColigada(DadosFuncRM.CODCOLIGADA);
    //const gestSol = getGestorSolicitante(
    //  DadosFuncRM.CHAPA,
    //  DadosFuncRM.CODCOLIGADA,
    //);

    // Preencher cabeçalho
    document.getElementById("empresa").value = coligada.NOMECOLIGADA;
    document.getElementById("codColigadaSol").value = coligada.CODCOLIGADA;
    document.getElementById("departamento").value = DadosFuncRM.DEPARTAMENTO;
    document.getElementById("nomeCompleto").value = DadosFuncRM.NOME;
    document.getElementById("email").value = mail; // DadosFuncRM.EMAIL
    document.getElementById("cargo").value = DadosFuncRM.DESCFUNCAO;
    document.getElementById("matricula").value = DadosFuncRM.CHAPA;
    document.getElementById("telefone").value = DadosFuncRM.TELEFONE1;

    $("#dadosColaborador,#formSolicitacao").show();
    $("#aprovCoordenacaoAluno,#aprovCoordFin,#coordFinanceiraCR").hide();

    exibirPainelTipoSelecionado();

  } else if (currentTask == 13) {
    $("#aprovCoordFin,#coordFinanceiraCR").hide();
    $("#dadosColaborador,#formSolicitacao,#aprovCoordenacaoAluno").show();

    disablefield(
      "#dadosColaborador,#formSolicitacao,#painelInsensaoTaxaVestibular,#painelSolicitacaoBolsaBeneficios",
    );

    exibirPainelTipoSelecionado();

  } else if (currentTask == 20) {
    $("#coordFinanceiraCR").hide();
    $(
      "#dadosColaborador,#formSolicitacao,#aprovCoordenacaoAluno,#aprovCoordFin",
    ).show();

    disablefield(
      "#dadosColaborador,#formSolicitacao,#painelInsensaoTaxaVestibular,#painelSolicitacaoBolsaBeneficios,#aprovCoordenacaoAluno",
    );

    exibirPainelTipoSelecionado();
  } else if (currentTask == 26) {
    $(
      "#dadosColaborador,#formSolicitacao,#aprovCoordenacaoAluno,#aprovCoordFin,#coordFinanceiraCR",
    ).show();

    disablefield(
      "#dadosColaborador,#formSolicitacao,#painelInsensaoTaxaVestibular,#painelSolicitacaoBolsaBeneficios,#aprovCoordenacaoAluno,#aprovCoordFin",
    );

    exibirPainelTipoSelecionado();
  } else if (currentTask == 17) {
    $(
      "#dadosColaborador,#formSolicitacao"
    ).show();

    disablefield("#aprovCoordFin,#coordFinanceiraCR,#aprovCoordenacaoAluno");
      
    exibirPainelTipoSelecionado();

  }

});

// Função global para adicionar
function addCandidato(tablename) {
  wdkAddChild(tablename);
}

/**
 *
 * Validação feito apenas para EXEL
 * Validado com até 50 candidatos, com as colunas fora da sequencia dos campos do form e com outras colunas
 * Lógica: Quando o usuário seleciona um arquivo, o sistema lê a primeira aba do Excel e tenta "adivinhar" quais colunas correspondem a cada campo do formulário baseado no nome do cabeçalho. Depois, ele percorre as linhas de dados e preenche os campos do formulário para cada candidato encontrado.
 * O usuário pode ter as seguintes colunas no Excel (não necessariamente nessa ordem):
 * - Código/Inscrição/ID (para o campo nomeContratado)
 * - Nome/Completo/Candidato (para o campo nomeCompletoCandidato)
 * - Concurso/Vestibular/Edital (para o campo concurso)
 */

function importarDadosCandidatos() {
  var fileInput = document.getElementById("importarExcel");

  if (!fileInput.files[0]) {
    return FLUIGC.toast({
      message: "Por favor, selecione um arquivo Excel.",
      type: "warning",
    });
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, { type: "array" });
      var worksheet = workbook.Sheets[workbook.SheetNames[0]];
      var matriz = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      //Aviso para caso tentarem importar um arquivo sem o formato esperado (pelo menos um cabeçalho e uma linha de dados)
      if (matriz.length < 2)
        throw "A planilha deve ter ao menos um cabeçalho e uma linha de dados.";

      // O cabeçalho é a primeira linha da matriz, e as linhas de dados são as subsequentes
      var cabecalho = matriz[0];
      var linhas = matriz.slice(1);

      // Função para normalizar texto (remover acentos e espaços)
      var norm = function (text) {
        return (text || "")
          .toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();
      };

      // Mapeamento das colunas (Regex ajustada para capturar variações de 'Código')
      var idx = {
        codigo: cabecalho.findIndex((c) =>
          /codigo|cod|insc|id|num/i.test(norm(c)),
        ),
        nome: cabecalho.findIndex((c) => /nome|completo|cand/i.test(norm(c))),
        concurso: cabecalho.findIndex((c) => /conc|vest|edital/i.test(norm(c))),
        curso: cabecalho.findIndex((c) =>
          /curso|opcao|pretendido/i.test(norm(c)),
        ),
      };

      // Verifica se encontrou pelo menos as colunas de código e nome, que são essenciais para o formulário
      var count = 0;
      linhas.forEach(function (linha) {
        // Pula linhas totalmente vazias ou sem nome
        if (linha.length === 0 || !linha[idx.nome]) return;

        // Adiciona linha na Pai x Filho
        var id = wdkAddChild("tableCandidato");

        // --- PREENCHIMENTO DO CÓDIGO ---
        if (idx.codigo > -1 && linha[idx.codigo] != null) {
          var valorCodigo = linha[idx.codigo].toString().trim();

          // Verifica se o campo se comporta como ZOOM ou INPUT comum
          if (
            window["codigoCandidato___" + id] &&
            typeof window["codigoCandidato___" + id].setValue === "function"
          ) {
            window["codigoCandidato___" + id].setValue(valorCodigo);
          } else {
            $("#codigoCandidato___" + id).val(valorCodigo);
          }
        }

        // --- PREENCHIMENTO DO NOME ---
        if (idx.nome > -1 && linha[idx.nome]) {
          $("#nomeCompletoCandidato___" + id).val(
            linha[idx.nome].toString().trim(),
          );
        }

        // --- PREENCHIMENTO DOS ZOOMS (Concurso e Curso) ---
        if (idx.concurso > -1 && linha[idx.concurso]) {
          var valConc = linha[idx.concurso].toString().trim();
          if (window["concurso___" + id])
            window["concurso___" + id].setValue(valConc);
        }

        if (idx.curso > -1 && linha[idx.curso]) {
          var valCurso = linha[idx.curso].toString().trim();
          if (window["cursoPretendido___" + id])
            window["cursoPretendido___" + id].setValue(valCurso);
        }
        // Incrementa contador de candidatos importados
        count++;
      });

      FLUIGC.toast({
        message: count + " candidatos importados com sucesso!",
        type: "success",
      });

      fileInput.value = "";
      $("#nomeArquivoImportacao").val("");
    } catch (err) {
      console.error("Erro na importação:", err);
      FLUIGC.toast({ message: "Erro ao processar: " + err, type: "danger" });
    }
  };
  reader.readAsArrayBuffer(fileInput.files[0]);
}
