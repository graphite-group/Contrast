var schedule = require('node-schedule');

module.exports = {

  addJob: function(challengeId, endTime){

    console.log("adding scheduled job",challengeId);

    Queue.create({
      challengeId: challengeId,
      endTime : endTime
    }).done(function(err, res){
      if(err){
        console.log("error scheduling task", err, challengeId);
      }else{
        console.log("scheduled task", res);
      }
    });



    schedule.scheduleJob(endTime, function(){
      require('./challengeService.js').endChallenge(challengeId, function(err, res){
        if(err){
          throw new Error("error ending the challenge");
        }else{
          Queue.destroy({
            challengeId: challengeId,
            endTime : endTime
          }).done(function(err, res){
            console.log("completed task?:", err, res);
          });
        }
      });


    });

  }

};

