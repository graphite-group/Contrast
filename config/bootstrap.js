/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {


  //****CAREFUL WHEN UNCOMMENTING THIS: Queue.destroy().done(function(err,res){});

  Queue.find()
  .done(function(err, tasks){
    //console.log("tasks", tasks);
    tasks.forEach(function(task){
      console.log("scheduling tasks after server reboot");
      scheduler.addJob(task.challengeId, task.endTime);
    });
  });

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};