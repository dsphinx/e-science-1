safestr = Ember.Handlebars.SafeString;
App.ClusterManagementController = Ember.Controller.extend({
	
	needs : ['clusterCreate','helpImages'],
	hue_login_message : '',
	hue_message : '',
    count : 0,
	orkaImages : [],
	
	cluster_slaves_newsize_static : null,
	cluster_slaves_newsize : function(key, value){
	    if (arguments.length > 1){//setter
	        this.set('cluster_slaves_newsize_static',value);
	    }
	    return Ember.isEmpty(this.get('cluster_slaves_newsize_static')) ? this.get('content.cluster_slaves_num') : this.get('cluster_slaves_newsize_static'); // getter
	}.property('content.cluster_slaves_num','cluster_slaves_newsize_static'),
	slaves_resize_disabled : function(){
	    // TODO conditionally disable all controls based on cluster / hadoop status
	    var enabled = this.get('content.cluster_status')=='1' && this.get('content.hadoop_status')!='2';
	    return !enabled;
	}.property('content.cluster_status','content.hadoop_status'),
	slaves_increment_disabled : function(){
	    // TODO arithmetic with slave config and available resources (cpu,ram,disk etc)
	    return false;
	}.property('cluster_slaves_newsize'),
	slaves_decrement_disabled : function(){
	    return this.get('cluster_slaves_newsize') > 1 ? false : true;
	}.property('cluster_slaves_newsize'),
	cluster_slaves_delta : function(){
	    return this.get('cluster_slaves_newsize') - this.get('content.cluster_slaves_num');
	}.property('content.cluster_slaves_num','cluster_slaves_newsize'),
	cluster_slaves_delta_decorated : function(){
	    var num_delta = Number(this.get('cluster_slaves_delta'));
	    if (num_delta>0){
	        return new safestr('<span class="text-success">+%@</span>'.fmt(num_delta));
	    }else if (num_delta<0){
	        return new safestr('<span class="text-danger">%@</span'.fmt(num_delta));
	    }else{
	        return new safestr('<b class="glyphicon glyphicon-resize-small"></b>');   
	    }
	}.property('cluster_slaves_delta'),
	
	actions : {
	    increment_size : function(){
	        this.set('cluster_slaves_newsize',this.get('cluster_slaves_newsize')+1);
	        $('#id_number_of_slaves').focus();
	    },
	    decrement_size : function(){
	        this.set('cluster_slaves_newsize',this.get('cluster_slaves_newsize')-1);
	        $('#id_number_of_slaves').focus();
	    },
	    reset_size : function(){
	        this.set('cluster_slaves_newsize',this.get('content.cluster_slaves_num'));
	    },
	    apply_resize : function(){
	        console.log('apply');
	    },
		help_hue_login : function(os_image){
			if (/Ecosystem/.test(os_image) || /Hue/.test(os_image)){
				this.set('hue_login_message', '<b>Hue first login</b><br><span class="text text-info">username : hduser</span>');
				this.set('hue_message', 'HUE');
			}else if (/CDH/.test(os_image)){
				this.set('hue_login_message', '<b>Hue first login</b><br><span class="text text-info">username : hdfs</span>');
				this.set('hue_message', 'CDH');
			}else if (/Debian/.test(os_image) || /Hadoop/.test(os_image)){
				this.set('hue_login_message', '');
				this.set('hue_message', '');
			}
			this.get('controllers.clusterCreate').set('hue_message', this.get('hue_message'));
		},
		visitActiveImage : function(os_image){
		    for (i=0;i<this.get('orkaImages').length;i++){
		        if (this.get('orkaImages').objectAt(i).get('image_name') == os_image){
		            this.get('controllers.helpImages').send('setActiveImage',this.get('orkaImages').objectAt(i).get('image_pithos_uuid'));
		            this.transitionToRoute('help.images');
		            break;
		        }
		    }
		},
        timer : function(status, store) {
            var that = this;
            if (Ember.isNone(this.get('timer'))) {
                this.set('timer', App.Ticker.create({
                    seconds : 5,
                    onTick : function() {
                        if (!store) {
                            store = that.store;
                        }
                        if (store && that.controllerFor('application').get('loggedIn')) {
                            var promise = store.fetch('user', 1);
                            promise.then(function(user) {
                                // success
                                var user_clusters = user.get('clusters');
                                var num_records = user_clusters.get('length');
                                var model = that.get('content');
                                var cluster_id = model.get('id');
                                var bPending = false;
                                for ( i = 0; i < num_records; i++) {
                                    if ((user_clusters.objectAt(i).get('id') == cluster_id) 
                                    && ((user_clusters.objectAt(i).get('cluster_status') == '2') || (user_clusters.objectAt(i).get('hadoop_status') == '2'))) {
                                        bPending = true;
                                        break;
                                    }
                                }
                                if (!bPending) {
                                    if (that.get('count') > 0) {
                                        that.set('count', that.get('count') - 1);
                                    } else {
                                        that.get('timer').stop();
                                        status = false;
                                    }
                                }
                            }, function(reason) {
                                that.get('timer').stop();
                                status = false;
                                console.log(reason.message);
                            });
                            return promise;
                        }
                    }
                }));
            } else {
                if (status) {
                    that.get('timer').start();
                } else {
                    that.get('timer').stop();
                }
            }
            if (status) {
                this.get('timer').start();
            } else {
                this.get('timer').stop();
            }
        },
    }

});