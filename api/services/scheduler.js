var schedule = require('node-schedule');

module.exports = {

  addJob: function(challengeId, endTime){
    
    console.log("adding scheduled job",challengeId);
    
    Queue.create({
      challengeId: challengeId,
      endTime : endTime
    });
    
    schedule.scheduleJob(endTime, function(){
      require('./challengeService.js').endChallenge(challengeId,function(err,res){
        if(err){
          throw new Error("error ending the challenge");
        }else{
          Queue.remove({
            challengeId: challengeId,
            endTime : endTime
          });
        }
      });


    });

  }

};

