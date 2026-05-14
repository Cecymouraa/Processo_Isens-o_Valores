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

function validarRegexCampo(campo, regex) {
  return regex.test((campo.val() || "").trim());
}

var beforeSendValidate = function (_numState, _nextState) {
  var obrigatorios = $(".obrigatorio:visible");
  var erros = [];

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

  var cpfAluno = $("#cpfAluno");
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

  var possuiCashback =
    ($("#possuiCashback").val() || "").toLowerCase() === "sim";
  if (possuiCashback) {
    var numeroBanco = $("#numeroBanco");
    var banco = $("#banco");
    var agencia = $("#agencia");
    var conta = $("#conta");
    var contaPix = $("#contaPix");

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

  if (erros.length > 0) {
    throw erros.join("\n");
  }
};

function validateForm(form) {
  var nAtividade = getValue("WKNumState");

  // Validação Coordenadoria de Admissão
  if (nAtividade == 13 || nAtividade == 0 || nAtividade == 4) {
    // Ajuste os IDs das tarefas conforme seu fluxo
    validarCampoAprovacao(
      form,
      "coordAprovado",
      "obsGestor",
      "Coordenação de Admissão",
    );
  }

  // Validação Coordenação Financeira
  if (nAtividade == 20) {
    validarCampoAprovacao(
      form,
      "aprovCoordFinAprovado",
      "observacaoContrato",
      "Coordenação Financeira",
    );
  }

  // Validação Financeiro CR
  if (nAtividade == 26) {
    validarCampoAprovacao(
      form,
      "coordFinanceiraAprovadoCR",
      "obsCoordenacaoFinanceira",
      "Financeiro CR",
    );
  }
}

// Função auxiliar para não repetir código na validação
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




/** Validação para os campos de observação dos paineis para quando for "Sim" a observação não ser obrigatória */

function validateForm(form) {

  // Validação Coordenadoria de Admissão
  if (currentTask == 13 || currentTask == 0 || currentTask == 4) {
    // Ajuste os IDs das tarefas conforme seu fluxo
    validarCampoAprovacao(
      form,
      "coordAprovado",
      "obsGestor",
      "Coordenação de Admissão",
    );
  }

  // Validação Coordenação Financeira
  if (currentTask == 20) {
    validarCampoAprovacao(
      form,
      "aprovCoordFinAprovado",
      "observacaoContrato",
      "Coordenação Financeira",
    );
  }

  // Validação Financeiro CR
  if (currentTask == 26) {
    validarCampoAprovacao(
      form,
      "coordFinanceiraAprovadoCR",
      "obsCoordenacaoFinanceira",
      "Financeiro CR",
    );
  }
}

// Função auxiliar para não repetir código na validação
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