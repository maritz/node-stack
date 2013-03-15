define(["libs/backbone/collection", "models/userModel"], function (baseCollection, userModel) {
  
  return {
    User: baseCollection.collection.extend({
      model: userModel.User,
      url: '/REST/User/'
    })
  }
  
});