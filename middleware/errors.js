module.exports.signUpErrors = (err) => {
  let errors = { general: "", email: "", password: "" };

  if (err.message.includes("email"))
    errors.email = "Cette adresse email n'est pas correcte.";

  if (err.message.includes("password"))
    errors.password =
      "Le mot de passe doit contenir 6 à 100 caractères avec une majuscule, une minuscule, un nombre, un caractère spécial et ne pas contenir d'espaces.";

  if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("email"))
    errors.email =
      "Cette adresse email est déjà enregistré, connectez vous avec si c'est la vôtre ";

  return errors;
};

module.exports.signInErrors = (err) => {
  let errors = { credentials: "" };

  if (err.message.includes("email")) {
    errors.credentials = "Email ou mot de passe incorrect.";
    return errors;
  }

  if (err.message.includes("password")) {
    errors.credentials = "Email ou mot de passe incorrect.";
    return errors;
  }

  if (err.message.includes("not accepted")) {
    errors.credentials =
      "Cet utilisateur n'a pas été encore validé par l'administrateur.";
    return errors;
  } else return;
};

module.exports.uploadErrors = (err) => {
  let errors = { format: "", maxSize: "" };

  if (err.message.includes("invalid file")) errors.format = "Wrong format";

  if (err.message.includes("max size"))
    errors.maxSize = "This file is over 500ko";

  return errors;
};
