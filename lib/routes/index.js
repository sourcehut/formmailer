exports.index = function(req, res){
  res.render('index.html');
};

exports.signupGet = function(req, res){
  res.render('signup.html', {action:'/mail/signup/send'});
};

