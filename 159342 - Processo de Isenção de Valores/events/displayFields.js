function displayFields(form, customHTML) {
  var activity = getValue("WKNumState");
  //var cardId = getValue("WKCardId");

  form.setShowDisabledFields(true); //ajustar campos antes de assumir tarefa
  form.setHidePrintLink(true); //tirar botão imprimir

  customHTML.append("<script>");
  customHTML.append("var currentTask='" + activity + "';");
  customHTML.append("</script>");

  if (activity == 4 || activity == 0) {
    var today = new Date();
    var year = today.getFullYear();
    var month =
      today.getMonth() + 1 < 10
        ? "0" + (today.getMonth() + 1)
        : today.getMonth() + 1;
    var day = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
    form.setValue("dataSolicitacao", day + "/" + month + "/" + year);

    console.log(getValue("WKUser"));
  }
}
