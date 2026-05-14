//Recupera informaçoes do usuário sincronizados dataset ds_funcionariosAtivos_rest pelo e-mail
const getDadosColigada = (codColigada) => {
    var constraints = new Array();
    var dataset = null;
    var coligada = {};

    constraints.push(DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST));
    dataset = DatasetFactory.getDataset("ds_empresaSync", null, constraints, null);

    if (dataset.values.length > 0) {
        coligada = dataset.values[0];
    }

    return coligada;
}

// Recupera informaçoees do usuáro sincronizados dataset
// ds_funcionariosAtivos_rest pelo e-mail
const getDadosFunc = (email) => {
    var constraints = new Array();
    var dataset = null;
    var user = {};

    constraints.push(DatasetFactory.createConstraint("EMAIL", email, email, ConstraintType.MUST));
    dataset = DatasetFactory.getDataset("ds_funcionariosAtivos", null, constraints, null);

    if (dataset.values.length > 0) {
        user = dataset.values[0];
    }

    return user;
}

// Recupera informaçoees do usuáro cadastrado no FLUIG pelo e-mail
const getUserByMail = (mail) => {
    var constraints = new Array();
    var dataset = null;
    var user = { "colleagueName": "", "colleagueId": "", "login": "" };

    constraints.push(DatasetFactory.createConstraint("mail", mail, mail, ConstraintType.MUST));
    constraints.push(DatasetFactory.createConstraint("active", true, true, ConstraintType.MUST));
    dataset = DatasetFactory.getDataset("colleague", null, constraints, null);

    if (dataset.values.length > 0) {
        user.colleagueId = dataset.values[0]["colleaguePK.colleagueId"];
        user.colleagueName = dataset.values[0]["colleagueName"];
        user.login = dataset.values[0]["login"];
        user.mail = dataset.values[0]["mail"];
    }

    return user;
};

// Desabilitar campos/DIV
const disablefield = (idDivs) => {
    $(idDivs).find(':input').prop('readonly', true);
    $(idDivs).find('select').css('touch-action', 'none').css('pointer-events', 'none').css('background', '#eee');
    $(idDivs).on("click", function () {
        return false;
    });
    $(idDivs).find('.btn').prop('disabled', 'disabled');
}

// Esconder Div
const hidediv = (idDivs) => {
    $(idDivs).css('display', 'none');
}

// Mostrar Div
const showdiv = (idDivs) => {
    $(idDivs).css('display', '');
}
