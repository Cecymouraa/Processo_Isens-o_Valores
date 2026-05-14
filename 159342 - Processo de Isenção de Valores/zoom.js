function obterIndicePaiFilho(inputId, prefixo) {
  if ((inputId || "").indexOf(prefixo + "___") !== 0) {
    return "";
  }

  return inputId.split("___")[1];
}

function obterValorDataset(item, campos) {
  for (var i = 0; i < campos.length; i++) {
    var valor = item ? item[campos[i]] : "";

    if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
      return String(valor).trim();
    }
  }

  return "";
}

function aplicarValorCampo(idCampo, valor) {
  var texto = valor || "";

  $("#" + idCampo).val(texto).trigger("change");

  // O zoom do Fluig pode sobrescrever o valor no mesmo ciclo do evento.
  setTimeout(function () {
    $("#" + idCampo).val(texto).trigger("change");
  }, 50);
}

function configurarZoomConcurso(indice, codigoCandidato) {
  if (!indice) {
    return;
  }

  var zoomId = "concurso___" + indice;
  var filtros = codigoCandidato
    ? "codigoCandidato," + String(codigoCandidato).trim()
    : "";

  if (typeof reloadZoomFilterValues === "function") {
    reloadZoomFilterValues(zoomId, filtros);
  }
}

function preencherLinhaCandidato(indice, dados) {
  if (!indice) {
    return;
  }

  if (dados.codigoCandidato !== undefined) {
    configurarZoomConcurso(indice, dados.codigoCandidato);
  }

  if (dados.codigoConcurso !== undefined) {
    aplicarValorCampo("concurso___" + indice, dados.codigoConcurso);
  }

  if (dados.nomeCompleto !== undefined) {
    aplicarValorCampo("nomeCompletoCandidato___" + indice, dados.nomeCompleto);
  }
}

function preencherLinhaImportadaCandidato(indice, dados) {
  if (!indice) {
    return;
  }

  if (dados.codigoCandidato !== undefined) {
    aplicarValorCampo("codigoCandidato___" + indice, dados.codigoCandidato);
  }

  preencherLinhaCandidato(indice, dados);

  // Reaplica depois que o zoom da linha dinâmica terminar de inicializar.
  setTimeout(function () {
    if (dados.codigoCandidato !== undefined) {
      aplicarValorCampo("codigoCandidato___" + indice, dados.codigoCandidato);
    }

    if (dados.codigoConcurso !== undefined) {
      aplicarValorCampo("concurso___" + indice, dados.codigoConcurso);
    }

    if (dados.nomeCompleto !== undefined) {
      aplicarValorCampo("nomeCompletoCandidato___" + indice, dados.nomeCompleto);
    }
  }, 150);
}

function limparLinhaCandidato(indice, limparConcurso) {
  if (!indice) {
    return;
  }

  if (limparConcurso) {
    configurarZoomConcurso(indice, "");
    aplicarValorCampo("concurso___" + indice, "");
  }

  aplicarValorCampo("nomeCompletoCandidato___" + indice, "");
}

function setSelectedZoomItem(selectedItem) {
  var inputId = selectedItem.inputId || "";

  if (inputId == "codCandidatoSolBolsa") {
    aplicarValorCampo(
      "nomeAlunoSolBolsa",
      obterValorDataset(selectedItem, ["nomeCompleto", "NOMECOMPLETO"])
    );
    return;
  }

  if (inputId.indexOf("codigoCandidato___") === 0) {
    var indiceCodigo = obterIndicePaiFilho(inputId, "codigoCandidato");

    preencherLinhaCandidato(indiceCodigo, {
      codigoCandidato: obterValorDataset(selectedItem, [
        "codigoCandidato",
        "CODIGOCANDIDATO",
      ]),
      codigoConcurso: obterValorDataset(selectedItem, [
        "codigoConcurso",
        "codigoConcurso ",
        "CODIGOCONCURSO",
        "codConcurso",
        "CODCONCURSO",
      ]),
      nomeCompleto: obterValorDataset(selectedItem, [
        "nomeCompleto",
        "NOMECOMPLETO",
      ]),
    });
    return;
  }

  if (inputId.indexOf("concurso___") === 0) {
    var indiceConcurso = obterIndicePaiFilho(inputId, "concurso");
    var codigoDaLinha = $("#codigoCandidato___" + indiceConcurso).val();

    configurarZoomConcurso(indiceConcurso, codigoDaLinha);

    preencherLinhaCandidato(indiceConcurso, {
      nomeCompleto: obterValorDataset(selectedItem, [
        "nomeCompleto",
        "NOMECOMPLETO",
      ]),
    });
  }
}

function removedZoomItem(removedItem) {
  var inputId = removedItem.inputId || "";

  if (inputId == "codCandidatoSolBolsa") {
    aplicarValorCampo("nomeAlunoSolBolsa", "");
    return;
  }

  if (inputId.indexOf("codigoCandidato___") === 0) {
    limparLinhaCandidato(obterIndicePaiFilho(inputId, "codigoCandidato"), true);
    return;
  }

  if (inputId.indexOf("concurso___") === 0) {
    var indiceConcurso = obterIndicePaiFilho(inputId, "concurso");

    if (!$("#codigoCandidato___" + indiceConcurso).val()) {
      limparLinhaCandidato(indiceConcurso, false);
    }
  }
}
