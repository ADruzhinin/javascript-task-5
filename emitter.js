'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

function isEmitting(subscriber) {
    if ('options' in subscriber && 'frequency' in subscriber.options) {
        let currentFrequency = subscriber.options.currentFrequency;
        subscriber.options.currentFrequency++;

        return currentFrequency % subscriber.options.frequency === 0;
    }
    if ('options' in subscriber && 'times' in subscriber.options) {
        subscriber.options.times--;

        return subscriber.options.times >= 0;
    }

    return true;
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let events = {};

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Object} options
         * @returns {Object}
         */
        on: function (event, context, handler, options) {
            if (!(event in events)) {
                events[event] = [];
            }
            events[event].push({
                context,
                handler: handler.bind(context)
            });
            if (options) {
                let numberOfLastSubscriber = events[event].length - 1;
                events[event][numberOfLastSubscriber].options = options;
            }

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            let eventsForDelete = Object.keys(events).filter(
                storedEvent => storedEvent.indexOf(event + '.') === 0 || event === storedEvent);
            eventsForDelete.forEach(eventForDelete => {
                events[eventForDelete] = events[eventForDelete].filter(
                    subscriber => subscriber.context !== context);
            });

            return this;
        },


        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            let filteredNames = [];
            let countDots = (event.lastIndexOf('.') !== -1) ? event.match(/\./g).length : 0;
            for (let i = 0; i < countDots + 1; i++) {
                if (event in events) {
                    filteredNames.push(event);
                }
                event = event.slice(0, event.lastIndexOf('.'));
            }
            filteredNames.forEach(eventForCall => {
                events[eventForCall].forEach(subscriber => {
                    if (isEmitting(subscriber)) {
                        subscriber.handler();
                    }
                });
            });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            let options = times > 0 ? { times } : { times: Infinity };

            return this.on(event, context, handler, options);
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            let options = frequency > 0
                ? { frequency, currentFrequency: 0 }
                : { frequency: 1, currentFrequency: 0 };

            return this.on(event, context, handler, options);
        }
    };
}
