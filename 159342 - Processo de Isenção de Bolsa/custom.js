$(document).ready(function () {

  console.log("currentTask:", currentTask);
  console.log(
    "tableBolsas no DOM:",
    $("table[tablename='tableBolsas']").length,
  );
  // Liga radios de aprovacao ao campo de observacao: se reprovar, a observacao vira obrigatoria.
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

    $(document).on("change", seletorRadio, function () {
      gerenciar(this.value);
    });

    var valorMarcado = $(seletorRadio + ":checked").val();
    if (valorMarcado) {
      gerenciar(valorMarcado);
    }
  }

  // O valor financeiro so faz sentido na solicitacao de bolsa/beneficios.
  function alternarValorCoordFin() {
    var exibir = $("#TipodeSol").val() == "solicitacaoBolsaBeneficios";
    $("#grupoValorCoordFin").toggle(exibir);
    if (!exibir) {
      $("#valorCoordFin, #vencimentoCoordFin, #naturezaFinanceira").val("");
    }
  }

  configurarRegraAprovacao("coordAprovado", "obsGestor");
  configurarRegraAprovacao("aprovCoordFinAprovado", "observacaoContrato");
  configurarRegraAprovacao(
    "coordFinanceiraAprovadoCR",
    "obsCoordenacaoFinanceira",
  );
  configurarRegraAprovacao(
    "aprovAlcadaEspecial",
    "obsAprovacaoAlcadaEspecial",
  );

  // Esconde os paineis variaveis antes de mostrar apenas o painel do tipo selecionado.
  function esconderPaineisTipo() {
    $("#painelInsensaoTaxaVestibular").hide();
    $("#painelSolicitacaoBolsaBeneficios").hide();
  }

  // Comanda a troca entre "Isencao de taxa" e "Bolsa/beneficios".
  function exibirPainelTipoSelecionado() {
    var tipo = $("#TipodeSol").val();
    esconderPaineisTipo();

    if (tipo == "insensaoTaxaVestibular") {
      $("#painelInsensaoTaxaVestibular").show();
      
    } else if (tipo == "solicitacaoBolsaBeneficios") {
      $("#painelSolicitacaoBolsaBeneficios").show();
      $(".row-bolsas-solicitadas").show();
      garantirLinhaTipoBolsa();
    }

    alternarValorCoordFin();
    alternarVisibilidadeAlcadaEspecial();
  }

  // Mascaras simples usadas nos campos digitaveis do formulario.
  function formatarCpf(valor) {
    var numeros = (valor || "").replace(/\D/g, "").slice(0, 11);
    numeros = numeros.replace(/(\d{3})(\d)/, "$1.$2");
    numeros = numeros.replace(/(\d{3})(\d)/, "$1.$2");
    numeros = numeros.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return numeros;
  }

  function formatarValorMonetario(valor) {
    var numeros = (valor || "").replace(/\D/g, "");
    if (!numeros) return "";
    var valorNumerico = (parseInt(numeros, 10) / 100).toFixed(2);
    return valorNumerico
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function formatarCompetencia(valor) {
    var numeros = (valor || "").replace(/\D/g, "").slice(0, 6);

    if (numeros.length > 2) {
      return numeros.slice(0, 2) + "/" + numeros.slice(2);
    }

    return numeros;
  }

  // Cashback habilita a escolha de forma de pagamento; sem cashback, os dados bancarios ficam ocultos.
  function alternarDadosBancariosCashback() {
    $(".bolsa-item").each(function () {
      var $item = $(this);
      var exibir =
        ($item.find(".possuiCashback").val() || "").toLowerCase() === "sim";
      var $gruposDadosBancarios = $item.find(
        ".tipoPagamento-group, .banco-group, .agencia-group, .conta-group, .tipoChavePix-group, .contaPix-group",
      );
      if (exibir) {
        $item.find(".tipoPagamento-group").show();
        alternarCamposPagamento($item);
      } else {
        $gruposDadosBancarios.hide();
      }
    });
  }

  // Campos de pagamento: se pix, mostra campos de chave pix; se conta corrente ou poupanca, mostra campos bancarios tradicionais; se nenhum, esconde ambos.
  function alternarCamposPagamento($item) {
    var tipo = $item.find(".tipoPagamento").val();
    var $camposBancarios = $item.find(
      ".banco-group, .agencia-group, .conta-group",
    );
    var $camposPix = $item.find(".tipoChavePix-group, .contaPix-group");

    if (tipo === "pixTipo") {
      $camposBancarios.hide();
      $camposPix.show();
    } else if (tipo === "contaCorrente" || tipo === "contaPoupanca") {
      $camposBancarios.show();
      $camposPix.hide();
    } else {
      $camposBancarios.hide();
      $camposPix.hide();
    }
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

  function alternarVisibilidadeAlcadaEspecial() {
    var possuiCashback = false;

    $(".possuiCashback").each(function () {
      if (($(this).val() || "").toLowerCase() === "sim") {
        possuiCashback = true;
        return false;
      }
    });

    var tipoSol = $("#TipodeSol").val();
    var $painel = $("#aprovAlcadaEspecial");

    var deveExibir = false;

    if (tipoSol === "solicitacaoBolsaBeneficios") {
      // Exibe a alçada especial para visualização nas aprovações
      // quando houver cashback
      if (
        (currentTask == 13 || currentTask == 20 || currentTask == 26) &&
        possuiCashback
      ) {
        deveExibir = true;
      }

      // Na própria atividade da alçada especial
      if (currentTask == 41) {
        deveExibir = true;
      }
    }

    $painel.toggle(deveExibir);
  }

  // Valida se o aluno com cashback existe como fornecedor no Protheus.
  // Exibe um alerta (toast) se não for encontrado.
  function validarFornecedorAluno() {
    var bolsaVisivel = $(".bolsa-item:visible").first();
    if (!bolsaVisivel.length) return;

    var cpfAluno = bolsaVisivel.find(".cpfAluno").first();
    var possuiCashback = (bolsaVisivel.find(".possuiCashback").first().val() || "").toLowerCase() === "sim";
    var documento = (cpfAluno.val() || "").replace(/\D/g, "");

    // A validação só ocorre se cashback for 'Sim' e o CPF estiver completo.
    if (possuiCashback && documento.length === 11) {
        try {
            var constraints = [DatasetFactory.createConstraint("cnpjcpf", documento, documento, ConstraintType.MUST)];
            var dataset = DatasetFactory.getDataset("ds_fornecedor", null, constraints, null);

            if (!dataset || !dataset.values || dataset.values.length === 0 || dataset.values[0].CODFOR == "") {
                FLUIGC.toast({
                    title: 'Atenção:',
                    message: 'Aluno não cadastrado como Fornecedor. Para cashback, o cadastro é obrigatório via processo no Conecta.',
                    type: 'warning',
                    timeout: 'slow'
                });
            }
        } catch (e) {
            console.error("Erro ao consultar fornecedor:", e);
        }
    }
  }

  // -------------------------------------------------------
  // GESTAO DAS LINHAS DE BOLSA
  // Regra: o template estatico (sem ID do WDK) NUNCA e removido,
  // pois o wdkAddChild precisa dele para clonar. Ele fica oculto
  // e e ignorado em toda logica de contagem e exibicao.
  // -------------------------------------------------------

  function linhasWDKVisiveis() {
    return $("table[tablename='tableBolsas'] tbody tr").filter(function () {
      return $(this).find("input[name*='___']").length > 0 && $(this).is(":visible");
    });
  }

  function agendarAtualizacaoBotoesTipoBolsa() {
    atualizarBotoesTipoBolsa();
    setTimeout(atualizarBotoesTipoBolsa, 100);
    setTimeout(atualizarBotoesTipoBolsa, 300);
  }

  function garantirLinhaTipoBolsa() {
    if (!$("#painelSolicitacaoBolsaBeneficios").is(":visible")) return;

    var isEditTask =
      typeof currentTask !== "undefined" &&
      (currentTask == 0 || currentTask == 4 || currentTask == 17 || currentTask == 5);

    if (
      isEditTask &&
      linhasWDKVisiveis().length === 0 &&
      typeof wdkAddChild === "function"
    ) {
      wdkAddChild("tableBolsas");
    }

    agendarAtualizacaoBotoesTipoBolsa();
  }

  // Mantem a primeira linha sem botao Excluir e libera exclusao nas linhas adicionadas.
  function atualizarBotoesTipoBolsa() {
    var $tabela = $("table[tablename='tableBolsas']");
    var $linhas = linhasWDKVisiveis();

    $tabela.find(".btnRemoverBolsa").hide();
    $linhas.removeClass("linha-primeira-bolsa");

    if ($linhas.length) {
      $linhas.first().addClass("linha-primeira-bolsa");
      $linhas.slice(1).find(".btnRemoverBolsa").show();
    }
  }


  // HANDLERS DE EVENTOS
  // Centraliza as reacoes aos campos da tela sem depender de onclick inline.


  $(document).on("change", ".tipoPagamento", function () {
    alternarCamposPagamento($(this).closest(".bolsa-item"));
  });

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

  $(document).on("change", ".possuiCashback", function () {
    alternarDadosBancariosCashback();
    alternarVisibilidadeAlcadaEspecial();
    validarFornecedorAluno();
  });

  $(document).on("input", ".cpfAluno", function () {
    $(this).val(formatarCpf($(this).val()));
  });

  $(document).on("change", ".cpfAluno", function () {
    validarFornecedorAluno();
  });

  $(document).on("input", ".competenciaBolsa, .competenciaBolsaFim", function () {
    $(this).val(formatarCompetencia($(this).val()));
  });

  $(document).on("input", ".campoValorMonetario", function () {
    $(this).val(formatarValorMonetario($(this).val()));
  });

  $(document).on("input", ".numeroBanco", function () {
    $(this).val(permitirNumeros($(this).val()));
  });

  $(document).on("input", ".agencia, .conta", function () {
    $(this).val(permitirNumerosComHifen($(this).val()));
  });

  $(document).on("click", ".btnAdicionarBolsa", function () {
    $("table[tablename='tableBolsas']").find(".btnRemoverBolsa").hide();
    wdkAddChild("tableBolsas");
    agendarAtualizacaoBotoesTipoBolsa();
  });

  $(document).on("click", ".btnRemoverBolsa", function () {
    var $linhas = linhasWDKVisiveis();
    var $linhaAtual = $(this).closest("tr");

    if ($linhas.length > 1 && !$linhaAtual.hasClass("linha-primeira-bolsa")) {
      fnWdkRemoveChild(this);
      agendarAtualizacaoBotoesTipoBolsa();
    }
  });

  $(document).on("click", ".btnRemoverCandidato", function () {
    var totalLinhas = $("table[tablename='tableCandidato'] tbody tr").length;
    if (totalLinhas > 1) {
      fnWdkRemoveChild(this);
    } else {
      $(this).closest("tr").find("input, select, textarea").val("");
    }
  });

  
  // INICIALIZACAO
  // -------------------------------------------------------

  function initializeFormDisplay() {
    esconderPaineisTipo();
    exibirPainelTipoSelecionado();
    alternarDadosBancariosCashback();

    $(".campoValorMonetario").each(function () {
      $(this).val(formatarValorMonetario($(this).val()));
    });
    $(".competenciaBolsa, .competenciaBolsaFim").each(function () {
      $(this).val(formatarCompetencia($(this).val()));
    });
  }

  // Em tarefas de visualização, os dados do formulário podem demorar para carregar (condição de corrida).
  // A abordagem robusta é aguardar os campos-chave que controlam a visibilidade serem preenchidos.
  function waitForFields(callback) {
    var attempts = 0;
    var checkInterval = setInterval(function () {
      var tipoSol = $("#TipodeSol").val();
      var tabelaPresente = $("table[tablename='tableBolsas']").length > 0;
      var isReady = tipoSol && tabelaPresente;
      
      if (isReady || ++attempts > 30) {
        clearInterval(checkInterval);
        callback();
      }
    }, 100);
  }

  

  function disableAllZooms() {
    setTimeout(function () {
      $('input[type="zoom"]').each(function () {
        var input = $(this);
        input.prop("readonly", false); // Desfaz o readonly do disablefield
        var zoomName = input.attr("name");
        if (window[zoomName]) {
          window[zoomName].disable(true);
        }
      });
    }, 500);
  }

  esconderPaineisTipo();


  if (
    (currentTask == 0 || currentTask == 4 || currentTask == 5) &&
    $("#TipodeSol").val() === ""
  ) {
    // Formulario realmente novo, sem dados
    initializeFormDisplay();
  } else {
    // Visualizacao ou tarefa com dados ja preenchidos: espera carregar
    waitForFields(initializeFormDisplay);
  }

  // LOGICA POR TAREFA (currentTask)

  if (currentTask == 4 || currentTask == 0) {
    // Inicio da solicitacao: carrega dados do colaborador logado e esconde aprovacoes.
    const mail = parent.WCMAPI.userEmail;
    const user = parent.WCMAPI.user;
    const DadosFuncRM = getDadosFunc(mail);
    const DadosFuncFluig = getUserByMail(mail);
    const coligada = getDadosColigada(DadosFuncRM.CODCOLIGADA);

    document.getElementById("empresa").value = coligada.NOMECOLIGADA;
    document.getElementById("codColigadaSol").value = coligada.CODCOLIGADA;
    document.getElementById("filialProtheus").value = coligada.FILIALPROTHEUS || "";
    document.getElementById("departamento").value = DadosFuncRM.DEPARTAMENTO;
    document.getElementById("nomeCompleto").value = DadosFuncRM.NOME;
    document.getElementById("email").value = mail;
    document.getElementById("cargo").value = DadosFuncRM.DESCFUNCAO;
    document.getElementById("matricula").value = DadosFuncRM.CHAPA;
    document.getElementById("telefone").value = DadosFuncRM.TELEFONE1;

    $("#dadosColaborador,#formSolicitacao").show();
    $(
      "#aprovCoordenacaoAluno,#aprovCoordFin,#coordFinanceiraCR,#aprovAlcadaEspecial"
    ).hide(); // #aprovAlcadaEspecial will be handled by alternarVisibilidadeAlcadaEspecial
  } else if (currentTask == 13) {
    // Coordenacao do aluno: aprova com a solicitacao bloqueada para edicao. O painel da alcada especial fica visivel, mas nao editavel.
    $("#aprovCoordFin,#coordFinanceiraCR").hide();
    $(
      "#dadosColaborador,#formSolicitacao,#aprovCoordenacaoAluno, #aprovAlcadaEspecial",
    ).show();
    disablefield(
      "#dadosColaborador,#formSolicitacao,#painelInsensaoTaxaVestibular,#painelSolicitacaoBolsaBeneficios,#aprovAlcadaEspecial"
    );
    disableAllZooms();
  }  else if (currentTask == 20) {
    // Coordenacao Financeira: aprova com a solicitacao bloqueada para edicao. O painel da alcada especial fica visivel, mas nao editavel.
    $("#coordFinanceiraCR").hide();
    $(
      "#dadosColaborador,#formSolicitacao,#aprovCoordenacaoAluno,#aprovCoordFin, #aprovAlcadaEspecial",
    ).show();
    disablefield(
      "#dadosColaborador,#formSolicitacao,#painelInsensaoTaxaVestibular,#painelSolicitacaoBolsaBeneficios,#aprovCoordenacaoAluno,#aprovAlcadaEspecial"
    );
    disableAllZooms();
  } else if (currentTask == 26) {
    // Financeiro CR: atua depois das aprovacoes anteriores. O painel da alcada especial fica visivel, mas nao editavel.
    $(
      "#dadosColaborador,#formSolicitacao,#aprovCoordenacaoAluno,#aprovCoordFin,#coordFinanceiraCR, #aprovAlcadaEspecial",
    ).show();
    disablefield(
      
      "#dadosColaborador,#formSolicitacao,#painelInsensaoTaxaVestibular,#painelSolicitacaoBolsaBeneficios,#aprovCoordenacaoAluno,#aprovCoordFin,#aprovAlcadaEspecial"
    );
    disableAllZooms();
  } else if (currentTask == 17) { // Atividade de ajuste: reabre dados da solicitacao e bloqueia paineis de aprovacao.
    // Atividade de ajuste: reabre dados da solicitacao e bloqueia paineis de aprovacao.
    $("#dadosColaborador,#formSolicitacao").show();
    disablefield("#aprovCoordFin,#coordFinanceiraCR,#aprovCoordenacaoAluno,#aprovAlcadaEspecial");
    exibirPainelTipoSelecionado();
  } else if (currentTask == 41) {
    // Alcada especial: exibe apenas o painel da alcada e o historico necessario.
    $("#aprovCoordFin,#coordFinanceiraCR,#aprovCoordenacaoAluno").hide();
    $("#dadosColaborador,#formSolicitacao").show();
    disablefield(
      "#dadosColaborador,#formSolicitacao,#painelInsensaoTaxaVestibular,#painelSolicitacaoBolsaBeneficios,#aprovCoordenacaoAluno,#aprovCoordFin,#coordFinanceiraCR",
    );

    // Garante que os campos da alçada especial estejam habilitados para o aprovador.
    $("#aprovAlcadaEspecial").find("input, textarea, select, button").prop("disabled", false);
    disableAllZooms();
  }
});


// FUNCOES GLOBAIS


// Usada pelo botao "Adicionar candidato" da tabela pai x filho.
function addCandidato(tablename) {
  wdkAddChild(tablename);
}

// Mantida global para compatibilidade com chamadas inline antigas do formulario.
function customRemoveBolsaChild(oElement) {
  if (typeof modForm === "undefined" || modForm !== "VIEW") {
    fnWdkRemoveChild(oElement);
  }
}

// Le a planilha de candidatos, identifica colunas pelo cabecalho e cria linhas no pai x filho.
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

      if (matriz.length < 2)
        throw "A planilha deve ter ao menos um cabeçalho e uma linha de dados.";

      var cabecalho = matriz[0];
      var linhas = matriz.slice(1);

      var norm = function (text) {
        return (text || "")
          .toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();
      };

      var idx = {
        codigo: cabecalho.findIndex(function (c) {
          return /codigo|cod|insc|id|num/i.test(norm(c));
        }),
        nome: cabecalho.findIndex(function (c) {
          return /nome|completo|cand/i.test(norm(c));
        }),
        concurso: cabecalho.findIndex(function (c) {
          return /conc|vest|edital/i.test(norm(c));
        }),
        curso: cabecalho.findIndex(function (c) {
          return /curso|opcao|pretendido/i.test(norm(c));
        }),
      };

      var count = 0;
      linhas.forEach(function (linha) {
        if (linha.length === 0 || !linha[idx.nome]) return;

        var id = wdkAddChild("tableCandidato");

        if (idx.codigo > -1 && linha[idx.codigo] != null) {
          var valorCodigo = linha[idx.codigo].toString().trim();
          if (
            window["codigoCandidato___" + id] &&
            typeof window["codigoCandidato___" + id].setValue === "function"
          ) {
            window["codigoCandidato___" + id].setValue(valorCodigo);
          } else {
            $("#codigoCandidato___" + id).val(valorCodigo);
          }
        }

        if (idx.nome > -1 && linha[idx.nome]) {
          $("#nomeCompletoCandidato___" + id).val(
            linha[idx.nome].toString().trim(),
          );
        }

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
