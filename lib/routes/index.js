exports.index = function(req, res){
  res.render('index.html');
};

exports.signupGet = function(req, res){
  res.render('signup.html', {action:'/mail/signup/send'});
};

exports.signinGet = function(req, res){
  res.render('signin.html');
};

exports.signin = function(req, res){
  res.render('signin.html', {status:'Incorrect username or password'});
};
