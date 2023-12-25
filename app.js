return {
    node_name: '',
    manifest: {
        timers: ['inactivity_timer']
    },
    persist: {
        version: 1,
        data: []
    },
    config: {
	},
	full_refresh_needed: true,
	inactivity_timeout: 30*1000,
    handler: function (event, response) {
        this.wrap_event(event);
        this.wrap_response(response);
        this.state_machine.handle_event(event, response);
    },
    log: function (object) {
		object.logentry_from = this.node_name;
        req_data(this.node_name, '"type": "log", "data":' + JSON.stringify(object), 9, true)
    },
    is_connected: function(){
        return get_common().app_status == 'connected'
    },
	weather_retrieve: function() {
        if(this.is_connected()){
			req_data(this.node_name, '"commuteApp._.config.commute_info":{"dest":"RetrieveForecast","action":"start"}', 999999, true)
		}
	},
    draw_info: function (response) {		
		response.emulate_double_tap();
        response.draw = {
            node_name: this.node_name,
            package_name: this.package_name,
            layout_function: 'layout_parser_json',
            background: get_common().U('INVERTED')?'BGIweather.raw':'',
            array: [],
            update_type: this.full_refresh_needed ? 'gc4' : 'du4',
            skip_invert: true,
        };
		var layout_info = {
			json_file: 'forecast_layout',
		}
		
		if (this.config.weather_current !== undefined) {
			layout_info['plaats'] = this.config.weather_current.city;
			layout_info['temp'] = this.config.weather_current.current_temp + ' °C';
		}		
		if (this.config.weather_forecast !== undefined) {
			layout_info['d0'] = Math.round(this.config.weather_forecast.d0tmin) + ' °C\n' + Math.round(this.config.weather_forecast.d0tmax) + ' °C\n' + Math.ceil(this.config.weather_forecast.d0rain) + ' ' + this.config.weather_forecast.unit_rain;
			layout_info['u0'] = 'min:\n' + 'max:\n' + 'regen:';
			layout_info['d1'] = 'Morgen\nmin: ' + Math.round(this.config.weather_forecast.d1tmin) + '\nmax: ' + Math.round(this.config.weather_forecast.d1tmax) + '\nregen: ' + Math.ceil(this.config.weather_forecast.d1rain);
			layout_info['d2'] = 'Overmorgen\n' + Math.round(this.config.weather_forecast.d2tmin) + ' °C\n' + Math.round(this.config.weather_forecast.d2tmax) + ' °C\n' + Math.ceil(this.config.weather_forecast.d2rain) + ' ' + this.config.weather_forecast.unit_rain;
		}
		layout_info['button_middle'] = 'icHome';
		layout_info['button_middle_x'] = get_common().U('WATCH_MODE')=='LEFTIE'? 10 : 210;
		layout_info['invert'] = get_common().U('INVERTED');
		response.draw[this.node_name] = {
			'layout_function': 'layout_parser_json',
			'layout_info': layout_info,
		}
		this.full_refresh_needed=false;
		stop_timer(this.node_name, 'inactivity_timer')
		start_timer(this.node_name, 'inactivity_timer', this.inactivity_timeout)
	},
    wrap_state_machine: function(state_machine) {
        state_machine.set_current_state = state_machine.d
        state_machine.handle_event = state_machine._
        state_machine.get_current_state = function(){
            return state_machine.n
        }
        return state_machine
    },
    wrap_event: function (system_state_update_event) {
        if (system_state_update_event.type === 'system_state_update') {
            system_state_update_event.concerns_this_app = system_state_update_event.de
            system_state_update_event.old_state = system_state_update_event.ze
            system_state_update_event.new_state = system_state_update_event.le
        }
        return system_state_update_event
    },
    wrap_response: function (response) {
        response.move_hands = function (degrees_hour, degrees_minute, relative) {
            response.move = {
                h: degrees_hour,
                m: degrees_minute,
                is_relative: relative
            }
        }
        response.go_home = function (kill_app) {
            response.action = {
                type: 'go_home',
                Se: kill_app
            }
        }
        response.send_user_class_event = function (event_type) {
            response.send_generic_event({
                type: event_type,
                class: 'user'
            })
        }
        response.emulate_double_tap = function(){
            this.send_user_class_event('double_tap')
        }
        response.send_generic_event = function (event_object) {
            if (response.i == undefined) response.i = []
            response.i.push(event_object)
        }
        return response
    },
    handle_global_event: function (self, state_machine, event, response) {
        if (event.type === 'system_state_update' && event.concerns_this_app === true) {
            self.state_machine.set_current_state('weather_info');
        } else if(event.type === 'node_config_update' && event.node_name === self.node_name) {
			self.draw_info(response)
        } else if (event.type === 'middle_hold') {
            response.go_home(true)
        }
    },
    handle_state_specific_event: function (state, state_phase) {
        switch (state) {
            case 'weather_info': {
                if (state_phase == 'entry') {
                    return function (self, response) {
                        response.move_hands(270,270,false);
						self.draw_info(response)
						self.weather_retrieve()
                  }
                }
                if (state_phase == 'during') {
                    return function (self, state_machine, event, response) {
						if (event.type === 'middle_short_press_release' || event.type === 'flick_away'
						|| (event.type == 'timer_expired' && is_this_timer_expired(event, self.node_name, 'inactivity_timer'))) {
							response.go_home(true)
						}
					}
                }
                if (state_phase == 'exit') {
					return function (arg, arg2) {
//                    return function (self, response) {
						stop_timer(self.node_name, 'inactivity_timer');
					};
                }
                break;
            }
        }
        return
    },
    init: function () {
        this.state_machine = new state_machine(
            this,
            this.handle_global_event,
            this.handle_state_specific_event,
            undefined,
            'background'
        );
        this.wrap_state_machine(this.state_machine);
    },
}
