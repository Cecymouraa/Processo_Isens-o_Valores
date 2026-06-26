// Aplica destaque visual nos campos recusados pela validacao client-side.
function marcarCampoInvalido(campo) {
  campo.css({
    "background-color": "#F2DEDE",
    border: "1px solid #A94442",
  });
}

function limparCampoInvalido(campo) {
  campo.css({
    "background-color": "",
    border: "",
  });
}

// Valida CPF pelos digitos verificadores oficiais.
function validaCPF(cpf) {
  cpf = (cpf || "").replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  var soma = 0;
  var resto;
  var i;

  for (i = 1; i <= 9; i++) {
    soma += parseInt(cpf.charAt(i - 1), 10) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) {
    resto = 0;
  }

  if (resto !== parseInt(cpf.charAt(9), 10)) {
    return false;
  }

  soma = 0;

  for (i = 1; i <= 10; i++) {
    soma += parseInt(cpf.charAt(i - 1), 10) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) {
    resto = 0;
  }

  return resto === parseInt(cpf.charAt(10), 10);
}

function validaFornecedorProtheus(cpfAluno) {
  var documento = (cpfAluno || "").replace(/\D/g, "");

  if (!documento) {
    return false;
  }

  try {
    var constraints = [];
    constraints.push(
      DatasetFactory.createConstraint(
        "cnpjcpf",
        documento,
        documento,
        ConstraintType.MUST
      )
    );

    var dataset = DatasetFactory.getDataset(
      "ds_fornecedor",
      null,
      constraints,
      null
    );

    return (
      dataset &&
      dataset.values &&
      dataset.values.length > 0 &&
      dataset.values[0].CODFOR != ""
    );
  } catch (e) {
    console.error("Erro ao validar fornecedor no Protheus:", e);
    return false;
  }
}

function validarRegexCampo(campo, regex) {
  return regex.test((campo.val() || "").trim());
}

// Executa antes do envio da tarefa: valida campos visiveis e regras de tela.
var beforeSendValidate = function (_numState, _nextState) {
  var obrigatorios = $(".obrigatorio:visible");
  var erros = [];
  var bolsaVisivel = $(".bolsa-item:visible").first();

  obrigatorios.each(function () {
    var label = $(this);
    var forId = label.attr("for");
    if (!forId) return;

    var campo = $("#" + forId);

    if (campo.prop("disabled") || campo.prop("readonly")) return;

    if (!campo.val() || campo.val().trim() === "") {
      var nomeCampo = label.text().trim();
      erros.push('O campo "' + nomeCampo + '" e obrigatorio.');
      marcarCampoInvalido(campo);
    } else {
      limparCampoInvalido(campo);
    }
  });

  var cpfAluno = bolsaVisivel.find(".cpfAluno").first();
  var possuiCashback =
    (bolsaVisivel.find(".possuiCashback").first().val() || "").toLowerCase() ===
    "sim";

  if (
    cpfAluno.is(":visible") &&
    !cpfAluno.prop("disabled") &&
    !cpfAluno.prop("readonly") &&
    cpfAluno.val() &&
    !validaCPF(cpfAluno.val())
  ) {
    erros.push('O campo "CPF do aluno" esta invalido.');
    marcarCampoInvalido(cpfAluno);
  }

  if (
    cpfAluno.is(":visible") &&
    !cpfAluno.prop("disabled") &&
    !cpfAluno.prop("readonly") &&
    cpfAluno.val() &&
    validaCPF(cpfAluno.val()) &&
    possuiCashback &&
    !validaFornecedorProtheus(cpfAluno.val())
  ) {
    erros.push(


      "Aluno não cadastrado como Fornecedor no sistema. Por favor, abra uma solicitação para cadastro no Conecta antes de prosseguir com o cashback."
    );
    marcarCampoInvalido(cpfAluno);
  }

  // Dados bancarios so sao avaliados quando cashback estiver marcado como Sim.
  if (possuiCashback) {
    var numeroBanco = bolsaVisivel.find(".numeroBanco").first();
    var banco = bolsaVisivel.find(".banco").first();
    var agencia = bolsaVisivel.find(".agencia").first();
    var conta = bolsaVisivel.find(".conta").first();
    var contaPix = bolsaVisivel.find(".contaPix").first();

    if (numeroBanco.val() && !validarRegexCampo(numeroBanco, /^\d+$/)) {
      erros.push('O campo "Nº do banco" deve conter apenas numeros.');
      marcarCampoInvalido(numeroBanco);
    } else {
      limparCampoInvalido(numeroBanco);
    }

    if (banco.val() && banco.val().trim().length < 3) {
      erros.push('O campo "Banco" deve ser preenchido com um nome valido.');
      marcarCampoInvalido(banco);
    } else if (banco.val()) {
      limparCampoInvalido(banco);
    }

    if (agencia.val() && !validarRegexCampo(agencia, /^[0-9-]+$/)) {
      erros.push('O campo "Agencia" deve conter apenas numeros e hifen.');
      marcarCampoInvalido(agencia);
    } else if (agencia.val()) {
      limparCampoInvalido(agencia);
    }

    if (conta.val() && !validarRegexCampo(conta, /^[0-9-]+$/)) {
      erros.push('O campo "Conta" deve conter apenas numeros e hifen.');
      marcarCampoInvalido(conta);
    } else if (conta.val()) {
      limparCampoInvalido(conta);
    }

    if (contaPix.val() && contaPix.val().trim().length < 3) {
      erros.push('O campo "Pix" deve ser preenchido com uma chave valida.');
      marcarCampoInvalido(contaPix);
    } else if (contaPix.val()) {
      limparCampoInvalido(contaPix);
    }
  }

  // Quando FIES = Nao, cada linha do pai x filho precisa de tipo de bolsa e competencia.
  if ($(".row-bolsas-solicitadas").is(":visible")) {
    $("table[tablename='tableBolsas'] tbody tr:visible").each(function () {
      var linha = $(this);
      var tipoBolsa = linha.find("[name^='tipoBolsa']").first();
      var competencia = linha.find("[name^='competenciaBolsa']").first();

      if (tipoBolsa.length && !tipoBolsa.val()) {
        erros.push('O campo "Tipo de bolsa" e obrigatorio.');
        marcarCampoInvalido(tipoBolsa);
      } else if (tipoBolsa.length) {
        limparCampoInvalido(tipoBolsa);
      }

      if (competencia.length && !competencia.val()) {
        erros.push('O campo "Competencia" e obrigatorio.');
        marcarCampoInvalido(competencia);
      } else if (
        competencia.length &&
        !/^(0[1-9]|1[0-2])\/\d{4}$/.test(competencia.val())
      ) {
        erros.push('O campo "Competencia" deve estar no formato MM/AAAA.');
        marcarCampoInvalido(competencia);
      } else if (competencia.length) {
        limparCampoInvalido(competencia);
      }
    });
  }

  if (erros.length > 0) {
    throw erros.join("\n");
  }
};

function validateForm(form) {
  var nAtividade = getValue("WKNumState");

  // Validacao server-side da Coordenadoria de Admissao.
  if (nAtividade == 13 || nAtividade == 0 || nAtividade == 4) {
    validarCampoAprovacao(
      form,
      "coordAprovado",
      "obsGestor",
      "Coordenação de Admissão",
    );
  }

  // Validacao server-side da Coordenacao Financeira.
  if (nAtividade == 20) {
    validarCampoAprovacao(
      form,
      "aprovCoordFinAprovado",
      "observacaoContrato",
      "Coordenação Financeira",
    );
  }

  // Valor financeiro e obrigatorio apenas para solicitacao de bolsa/beneficios.
  if (nAtividade == 20) {
    validarValorCoordFin(form);
  }

  if (nAtividade == 26) {
    validarCampoAprovacao(
      form,
      "coordFinanceiraAprovadoCR",
      "obsCoordenacaoFinanceira",
      "Financeiro CR",
    );
  }

  // Validacao server-side da Alçada Especial.
  // A validação só deve ocorrer na sua própria tarefa (41).
  if (nAtividade == 41) {
    var tipoSolicitacao = form.getValue("TipodeSol");
    if (tipoSolicitacao == "solicitacaoBolsaBeneficios") {
      validarCampoAprovacao(
        form,
        "aprovAlcadaEspecial",
        "obsAprovacaoAlcadaEspecial",
        "Aprovação Alçada Especial",
      );
    }
  }
}

// Funcao auxiliar para nao repetir codigo na validacao das aprovacoes.
function validarCampoAprovacao(form, campoRadio, campoObs, nomePainel) {
  var aprovado = form.getValue(campoRadio);
  var obs = form.getValue(campoObs);

  if (aprovado == null || aprovado == "") {
    throw (
      "O campo 'Solicitação aprovada?' no painel " +
      nomePainel +
      " é obrigatório."
    );
  }

  if (aprovado != "sim" && (obs == null || obs.trim() == "")) {
    throw (
      "A 'Observação' no painel " +
      nomePainel +
      " é obrigatória quando a solicitação não é aprovada."
    );
  }
}

function validarValorCoordFin(form) {
  var tipoSolicitacao = form.getValue("TipodeSol");
  var valor = form.getValue("valorCoordFin");

  if (tipoSolicitacao != "solicitacaoBolsaBeneficios") {
    return;
  }

  if (valor == null || String(valor).trim() == "") {
    throw "O campo 'Valor' no painel Coordenacao Financeira e obrigatorio para Solicitacao de bolsa e beneficios.";
  }

  var valorNumerico = parseFloat(
    String(valor).replace(/\./g, "").replace(",", ".")
  );

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    throw "O campo 'Valor' no painel Coordenacao Financeira deve ser maior que zero.";
  }
}
