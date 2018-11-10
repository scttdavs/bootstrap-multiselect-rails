/**
 * Bootstrap Multiselect (https://github.com/davidstutz/bootstrap-multiselect)
 *
 * Apache License, Version 2.0:
 * Copyright (c) 2012 - 2015 David Stutz
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a
 * copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * BSD 3-Clause License:
 * Copyright (c) 2012 - 2015 David Stutz
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    - Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 *    - Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 *    - Neither the name of David Stutz nor the names of its contributors may be
 *      used to endorse or promote products derived from this software without
 *      specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
! function () {
    "use strict"; // jshint ;_;

    function forEach(array, callback) {
        for (var index = 0; index < array.length; ++index) {
            callback(array[index], index);
        }
    }

    // https://davidwalsh.name/javascript-deep-merge
    function isMergeableObject(val) {
        var nonNullObject = val && typeof val === 'object'

        return nonNullObject &&
            Object.prototype.toString.call(val) !== '[object RegExp]' &&
            Object.prototype.toString.call(val) !== '[object Date]'
    }

    function emptyTarget(val) {
        return Array.isArray(val) ? [] : {}
    }

    function cloneIfNecessary(value, optionsArgument) {
        var clone = optionsArgument && optionsArgument.clone === true
        return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
    }

    function defaultArrayMerge(target, source, optionsArgument) {
        var destination = target.slice()
        source.forEach(function (e, i) {
            if (typeof destination[i] === 'undefined') {
                destination[i] = cloneIfNecessary(e, optionsArgument)
            } else if (isMergeableObject(e)) {
                destination[i] = deepmerge(target[i], e, optionsArgument)
            } else if (target.indexOf(e) === -1) {
                destination.push(cloneIfNecessary(e, optionsArgument))
            }
        })
        return destination
    }

    function mergeObject(target, source, optionsArgument) {
        var destination = {}
        if (isMergeableObject(target)) {
            Object.keys(target).forEach(function (key) {
                destination[key] = cloneIfNecessary(target[key], optionsArgument)
            })
        }
        Object.keys(source).forEach(function (key) {
            if (!isMergeableObject(source[key]) || !target[key]) {
                destination[key] = cloneIfNecessary(source[key], optionsArgument)
            } else {
                destination[key] = deepmerge(target[key], source[key], optionsArgument)
            }
        })
        return destination
    }

    function deepmerge(target, source, optionsArgument) {
        var array = Array.isArray(source);
        var options = optionsArgument || {
            arrayMerge: defaultArrayMerge
        }
        var arrayMerge = options.arrayMerge || defaultArrayMerge

        if (array) {
            return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
        } else {
            return mergeObject(target, source, optionsArgument)
        }
    }

    deepmerge.all = function deepmergeAll(array, optionsArgument) {
        if (!Array.isArray(array) || array.length < 2) {
            throw new Error('first argument should be an array with at least two elements')
        }

        // we are sure there are at least 2 values, so it is safe to have no initial value
        return array.reduce(function (prev, next) {
            return deepmerge(prev, next, optionsArgument)
        })
    }

    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    function toArray(nodeList) {
        return Array.prototype.slice.call(nodeList);
    }

    function createElement(template) {
        var div = document.createElement('div');
        div.innerHTML = template;
        return div.firstChild;
    }

    function isVisible(el) {
        return el.offsetHeight > 0 && el.style.display !== 'none';
    }

    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += ' ' + className;
        }
    }

    function hasClass(el, className) {
        if (el.classList) {
            el.classList.contains(className);
        } else {
            new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
        }
    }

    function removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className);
        } else {
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    function toggleClass(el, className, state) {
        if (state !== undefined) {
            if (state) {
                addClass(el, className);
            } else {
                removeClass(el, className);
            }
        } else {
            if (el.classList) {
                el.classList.toggle(className);
            } else {
                var classes = el.className.split(' ');
                var existingIndex = classes.indexOf(className);

                if (existingIndex >= 0) {
                    classes.splice(existingIndex, 1);
                } else {
                    classes.push(className);
                }

                el.className = classes.join(' ');
            }
        }
    }

    let matchesType;
    if (typeof Element !== 'undefined') { // so we don't break Node-side loading of this
        const types = [
            "matches", "matchesSelector",
            "webkitMatchesSelector", "mozMatchesSelector",
            "msMatchesSelector", "oMatchesSelector"
        ];
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            if (Element.prototype[type]) {
                matchesType = type;
                break;
            }
        }
    }

    function siblings(el) {
        Array.prototype.filter.call(el.parentNode.children, function (child) {
            return child !== el;
        });
    }

    function matches(el, selector) {
        return el[matchesType] && el[matchesType](selector);
    }

    function nextUntil(el, selector, filter) {
        var els = [];
        var nextEl = el.nextElementSibling
        while (nextEl && !matches(nextEl, selector)) {
            els.push(nextEl);
            nextEl = nextEl.nextElementSibling;
        }

        if (filter) {
            els = els.filter(filter);
        }

        return els;
    }

    function prevUntil(el, selector, filter) {
        var els = [];
        var prevEl = el.previousElementSibling
        while (prevEl && !matches(prevEl, selector)) {
            els.push(prevEl);
            prevEl = prevEl.previousElementSibling;
        }

        if (filter) {
            els = els.filter(filter);
        }

        return els;
    }

    function getNearest(el, selector) {
        if (!el) return null;
        if (matches(el, selector)) return el;
        return getNearest(el.parentNode, selector);
    }

    /**
     * Constructor to create a new multiselect using the given select.
     *
     * @param {Node} select
     * @param {Object} options
     * @returns {Multiselect}
     */
    function Multiselect(select, options) {

        this.select = select;

        // Placeholder via data attributes
        var dataPlaceholder = this.select.getAttribute("data-placeholder");
        if (dataPlaceholder) {
            options.nonSelectedText = dataPlaceholder;
        }

        var dataAttributes = {};
        if (this.select.hasAttributes()) {
            toArray(this.select.attributes).forEach(function (attr) {
                if (attr.name.indexOf("data-") > -1) {
                    dataAttributes[attr.name] = attr.value;
                }
            })
        }

        this.options = this.mergeOptions(deepmerge.all([{}, options || {}, dataAttributes]));

        console.log("OPTS", options, this.options)

        // Initialization.
        this.query = '';
        this.searchTimeout = null;
        this.lastToggledInput = null;

        this.options.multiple = this.select.getAttribute('multiple') === "multiple";
        this.options.onChange = this.options.onChange.bind(this);
        this.options.onDropdownShow = this.options.onDropdownShow.bind(this);
        this.options.onDropdownHide = this.options.onDropdownHide.bind(this);
        this.options.onDropdownShown = this.options.onDropdownShown.bind(this);
        this.options.onDropdownHidden = this.options.onDropdownHidden.bind(this);
        this.options.onInitialized = this.options.onInitialized.bind(this);

        // Build select all if enabled.
        this.buildContainer();
        this.buildButton();
        this.buildDropdown();
        this.buildSelectAll();
        this.buildDropdownOptions();
        this.buildFilter();

        this.updateButtonText();
        this.updateSelectAll(true);

        if (this.options.disableIfEmpty && this.select.getElementsByTagName('option').length <= 0) {
            this.disable();
        }

        this.select.style.display = "none";
        insertAfter(this.container, this.select);
        this.options.onInitialized(this.select, this.container);
    }

    Multiselect.prototype = {

        defaults: {
            /**
             * Default text function will either print 'None selected' in case no
             * option is selected or a list of the selected options up to a length
             * of 3 selected options.
             *
             * @param {Node} options
             * @param {Node} select
             * @returns {String}
             */
            buttonText: function (options, select) {
                if (this.disabledText.length > 0 &&
                    (this.disableIfEmpty || select.getAttribute('disabled')) &&
                    options.length == 0) {

                    return this.disabledText;
                } else if (options.length === 0) {
                    return this.nonSelectedText;
                } else if (this.allSelectedText &&
                    options.length === select.getElementsByTagName('option').length &&
                    select.getElementsByTagName('option').length !== 1 &&
                    this.multiple) {

                    if (this.selectAllNumber) {
                        return this.allSelectedText + ' (' + options.length + ')';
                    } else {
                        return this.allSelectedText;
                    }
                } else if (options.length > this.numberDisplayed) {
                    return options.length + ' ' + this.nSelectedText;
                } else {
                    var selected = '';
                    var delimiter = this.delimiterText;

                    toArray(options).forEach(function (option) {
                        var label = (option.getAttribute('label')) ? option.getAttribute('label') : option.textContent;
                        selected += label + delimiter;
                    });

                    return selected.substr(0, selected.length - 2);
                }
            },
            /**
             * Updates the title of the button similar to the buttonText function.
             *
             * @param {Node} options
             * @param {Node} select
             * @returns {@exp;selected@call;substr}
             */
            buttonTitle: function (options, select) {
                if (options.length === 0) {
                    return this.nonSelectedText;
                } else {
                    var selected = '';
                    var delimiter = this.delimiterText;

                    toArray(options).forEach(function (option) {
                        var label = option.getAttribute('label') ? option.getAttribute('label') : option.textContent;
                        selected += label + delimiter;
                    });
                    return selected.substr(0, selected.length - 2);
                }
            },
            /**
             * Create a label.
             *
             * @param {Node} element
             * @returns {String}
             */
            optionLabel: function (element) {
                return element.getAttribute('label') || element.textContent;
            },
            /**
             * Create a class.
             *
             * @param {Node} element
             * @returns {String}
             */
            optionClass: function (element) {
                return element.getAttribute('class');
            },
            /**
             * Triggered on change of the multiselect.
             *
             * Not triggered when selecting/deselecting options manually.
             *
             * @param {Node} option
             * @param {Boolean} checked
             */
            onChange: function (option, checked) {

            },
            /**
             * Triggered when the dropdown is shown.
             *
             * @param {Node} event
             */
            onDropdownShow: function (event) {

            },
            /**
             * Triggered when the dropdown is hidden.
             *
             * @param {NodeIterator
             */
            onDropdownHide: function (event) {

            },
            /**
             * Triggered after the dropdown is shown.
             *
             * @param {Node} event
             */
            onDropdownShown: function (event) {

            },
            /**
             * Triggered after the dropdown is hidden.
             *
             * @param {Node} event
             */
            onDropdownHidden: function (event) {

            },
            /**
             * Triggered on select all.
             */
            onSelectAll: function (checked) {

            },
            /**
             * Triggered after initializing.
             *
             * @param {Node} select
             * @param {Node} container
             */
            onInitialized: function (select, container) {

            },
            enableHTML: false,
            buttonClass: 'btn btn-default',
            inheritClass: false,
            buttonWidth: 'auto',
            buttonContainer: '<div class="btn-group" />',
            dropRight: false,
            dropUp: false,
            selectedClass: 'active',
            // Maximum height of the dropdown menu.
            // If maximum height is exceeded a scrollbar will be displayed.
            maxHeight: false,
            checkboxName: false,
            includeSelectAllOption: false,
            includeSelectAllIfMoreThan: 0,
            selectAllText: ' Select all',
            selectAllValue: 'multiselect-all',
            selectAllName: false,
            selectAllNumber: true,
            selectAllJustVisible: true,
            enableFiltering: false,
            enableCaseInsensitiveFiltering: false,
            enableFullValueFiltering: false,
            enableClickableOptGroups: false,
            enableCollapsibelOptGroups: false,
            filterPlaceholder: 'Search',
            // possible options: 'text', 'value', 'both'
            filterBehavior: 'text',
            includeFilterClearBtn: true,
            preventInputChangeEvent: false,
            nonSelectedText: 'None selected',
            nSelectedText: 'selected',
            allSelectedText: 'All selected',
            numberDisplayed: 3,
            disableIfEmpty: false,
            disabledText: '',
            delimiterText: ', ',
            templates: {
                button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> <b class="caret"></b></button>',
                ul: '<ul class="multiselect-container dropdown-menu"></ul>',
                filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
                filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button"><i class="glyphicon glyphicon-remove-circle"></i></button></span>',
                li: '<li><a tabindex="0"><label></label></a></li>',
                divider: '<li class="multiselect-item divider"></li>',
                liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'
            }
        },

        constructor: Multiselect,

        /**
         * Builds the container of the multiselect.
         */
        buildContainer: function () {
            this.container = createElement(this.options.buttonContainer);
            this.container.addEventListener('show.bs.dropdown', this.options.onDropdownShow);
            this.container.addEventListener('hide.bs.dropdown', this.options.onDropdownHide);
            this.container.addEventListener('shown.bs.dropdown', this.options.onDropdownShown);
            this.container.addEventListener('hidden.bs.dropdown', this.options.onDropdownHidden);
        },

        /**
         * Builds the button of the multiselect.
         */
        buildButton: function () {
            console.log("BUTTON", this.options.templates.button);
            var button = createElement(this.options.templates.button);
            this.button = button;
            console.log("BUTTON 2", this.button);
            this.options.buttonClass.split(' ').forEach(function (c) {
                addClass(this.button, c);
            }.bind(this));
            if (this.select.getAttribute('class') && this.options.inheritClass) {
                addClass(this.button, this.select.getAttribute('class'));
            }
            // Adopt active state.
            if (this.select.getAttribute('disabled')) {
                this.disable();
            } else {
                this.enable();
            }

            // Manually add button width if set.
            if (this.options.buttonWidth && this.options.buttonWidth !== 'auto') {
                this.button.style.width = this.options.buttonWidth;
                this.button.style.width = 'hidden';
                this.button.style.textOverflow = 'ellipsis';

                this.container.style.width = this.options.buttonWidth;
            }

            // Keep the tab index from the select.
            var tabindex = this.select.getAttribute('tabindex');
            if (tabindex) {
                this.button.setAttribute('tabindex', tabindex);
            }

            this.container.insertBefore(this.button, this.container.firstChild);
        },

        /**
         * Builds the ul representing the dropdown menu.
         */
        buildDropdown: function () {

            // Build ul.
            this.ul = createElement(this.options.templates.ul);

            if (this.options.dropRight) {
                addClass(this.ul, 'pull-right');
            }

            // Set max height of dropdown menu to activate auto scrollbar.
            if (this.options.maxHeight) {
                // TODO: Add a class for this option to move the css declarations.
                this.ul.style.maxHeight = this.options.maxHeight + 'px';
                this.ul.style.overflowY = 'auto';
                this.ul.style.overflowX = 'hidden';
            }

            if (this.options.dropUp) {

                var height = Math.min(this.options.maxHeight, this.select.querySelectorAll('option[data-role!="divider"]').length * 26 + this.select.querySelectorAll('option[data-role="divider"]').length * 19 + (this.options.includeSelectAllOption ? 26 : 0) + (this.options.enableFiltering || this.options.enableCaseInsensitiveFiltering ? 44 : 0));
                var moveCalc = height + 34;

                this.ul.style.maxHeight = height + 'px';
                this.ul.style.overflowY = 'auto';
                this.ul.style.overflowX = 'hidden';
                this.ul.style.marginTop = "-" + moveCalc + 'px';
            }

            this.container.appendChild(this.ul);
        },

        /**
         * Build the dropdown options and binds all nessecary events.
         *
         * Uses createDivider and createOptionValue to create the necessary options.
         */
        buildDropdownOptions: function () {

            toArray(this.select.children).forEach(function (element) {

                // Support optgroups and options without a group simultaneously.
                var tag = element.tagName.toLowerCase();

                if (element.value === this.options.selectAllValue) {
                    return;
                }

                if (tag === 'optgroup') {
                    this.createOptgroup(element);
                } else if (tag === 'option') {
                    if (element.getAttribute('data-role') === 'divider') {
                        this.createDivider();
                    } else {
                        this.createOptionValue(element);
                    }

                }

                // Other illegal tags will be ignored.
            }.bind(this));

            // Bind the change event on the dropdown elements.
            this.ul.addEventListener('change', function (event) {
                if (event.target.tagName.toLowerCase() !== 'input') return false;

                var checked = target.checked || false;
                var isSelectAllOption = target.value === this.options.selectAllValue;

                // Apply or unapply the configured selected class.
                if (this.options.selectedClass) {
                    var li = getNearest(target, 'li');
                    if (checked) {
                        addClass(li, this.options.selectedClass);
                    } else {
                        removeClass(li, this.options.selectedClass);
                    }
                }

                // Get the corresponding option.
                var value = target.value;
                var option = this.getOptionByValue(value);

                var options = this.select.getElementsByTagName('option');
                var optionsNotThis = toArray(options).filter(function (o) {
                    return o !== option
                });
                var inputs = this.container.getElementsByTagName('input');
                var checkboxesNotThis = toArray(inputs).filter(function (i) {
                    return i !== target;
                });

                if (isSelectAllOption) {
                    if (checked) {
                        this.selectAll(this.options.selectAllJustVisible);
                    } else {
                        this.deselectAll(this.options.selectAllJustVisible);
                    }
                } else {
                    if (checked) {
                        option.setAttribute('selected', true);

                        if (this.options.multiple) {
                            // Simply select additional option.
                            option.setAttribute('selected', true);
                        } else {
                            // Unselect all other options and corresponding checkboxes.
                            if (this.options.selectedClass) {
                                checkboxesNotThis.forEach(function (c) {
                                    var li = getNearest(c, 'li');
                                    removeClass(li, this.options.selectedClass);
                                }.bind(this));
                            }

                            checkboxesNotThis.forEach(function (c) {
                                c.checked = false;
                            });
                            optionsNotThis.forEach(function (o) {
                                o.setAttribute('selected', false);
                            });

                            // It's a single selection, so close.
                            this.button.click();
                        }

                        if (this.options.selectedClass === "active") {
                            optionsNotThis.forEach(function (o) {
                                var a = getNearest(o, 'a');
                                a.style.outline = "";
                            });
                        }
                    } else {
                        // Unselect option.
                        option.setAttribute('selected', false);
                    }

                    // To prevent select all from firing onChange: #575
                    this.options.onChange(option, checked);
                }

                this.select.dispatchEvent(new Event('change'));

                this.updateButtonText();
                this.updateSelectAll();

                if (this.options.preventInputChangeEvent) {
                    return false;
                }
            }.bind(this));

            this.ul.addEventListener('mousedown', function (e) {
                if (e.target.tagName.toLowerCase() !== 'a') return;

                if (e.shiftKey) return false; // Prevent selecting text by Shift+click
            });

            ['touchstart', 'click'].forEach(function (eventName) {
                this.ul.addEventListener(eventName, function (event) {
                    event.stopPropagation();

                    var target = event.target;

                    if (event.shiftKey && this.options.multiple) {
                        if (target.tagName.toLowerCase() === "label") { // Handles checkbox selection manually (see https://github.com/davidstutz/bootstrap-multiselect/issues/431)
                            event.preventDefault();
                            target = target.querySelector("input");
                            target.checked = !target.checked;
                        }
                        var checked = target.checked || false;

                        if (this.lastToggledInput !== null && this.lastToggledInput !== target) { // Make sure we actually have a range
                            var fromLi = getNearest(target, "li");
                            var fromLis = fromLi.parentNode.children;
                            var from = toArray(fromLis).indexOf(fromLi);

                            var toLi = getNearest(this.lastToggledInput, "li");
                            var toLis = toLi.parentNode.children;
                            var to = toArray(toLis).indexOf(toLi);

                            if (from > to) { // Swap the indices
                                var tmp = to;
                                to = from;
                                from = tmp;
                            }

                            // Make sure we grab all elements since slice excludes the last index
                            ++to;

                            // Change the checkboxes and underlying options
                            var rangeLis = toArray(this.ul.querySelectorAll("li"), from, to);
                            var range = rangeLis.reduce(function (agg, value) {
                                return agg.concat(toArray(value.querySelectorAll("input")));
                            }, []);

                            range.forEach(function (i) {
                                i.checked = checked;
                            });

                            if (this.options.selectedClass) {
                                range.forEach(function (i) {
                                    var li = getNearest(i, 'li');
                                    toggleClass(li, this.options.selectedClass, checked);
                                });
                            }

                            for (var i = 0, j = range.length; i < j; i++) {
                                var checkbox = range[i];

                                var option = this.getOptionByValue(checkbox.value);

                                option.setAttribute('selected', checked);
                            }
                        }

                        // Trigger the select "change" event
                        target.dispatchEvent(new Event('change'));
                    }

                    // Remembers last clicked option
                    if (target.tagName.toLowerCase() === "input" && !hasClass(getNearest(target, "li"), ".multiselect-item")) {
                        this.lastToggledInput = target;
                    }

                    target.blur();
                }.bind(this))
            }.bind(this));

            // Keyboard support.
            this.container.addEventListener('keydown.multiselect', function (event) {
                var isFocused = toArray(this.container.querySelectorAll('input[type="text"]')).filter(function (i) {
                    i === document.activeElement;
                });
                if (isFocused) {
                    return;
                }

                if (event.keyCode === 9 && hasClass(this.container, 'open')) {
                    this.button.click();
                } else {
                    var lis = toArray(this.container.querySelectorAll("li"));
                    lis = lis.filter(function (li) {
                        return !hasClass(li, "divider") && !hasClass(li, "disabled");
                    });
                    var items = lis.reduce(function (agg, value) {
                        return agg.concat(toArray(value.getElementsByTagName('a')))
                    }, []).filter(function (a) {
                        return isVisible(a);
                    })

                    if (!items.length) {
                        return;
                    }

                    var index = items.indexOf(document.activeElement);

                    // Navigation up.
                    if (event.keyCode === 38 && index > 0) {
                        index--;
                    }
                    // Navigate down.
                    else if (event.keyCode === 40 && index < items.length - 1) {
                        index++;
                    } else if (!~index) {
                        index = 0;
                    }

                    var current = items[index];
                    current.focus();

                    if (event.keyCode === 32 || event.keyCode === 13) {
                        var checkbox = current.querySelector('input');

                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }

                    event.stopPropagation();
                    event.preventDefault();
                }
            }.bind(this));

            if (this.options.enableClickableOptGroups && this.options.multiple) {
                this.ul.addEventListener('click', function (event) {
                    if (!matches(event.target, 'li.multiselect-group')) return;

                    event.stopPropagation();
                    var group = event.target.parentNode;

                    // Search all option in optgroup
                    var options = nextUntil(group, 'li.multiselect-group');
                    var visibleOptions = options.filter(function (o) {
                        return !hasClass("disabled") && isVisible(o);
                    });

                    // check or uncheck items
                    var allChecked = true;
                    var optionInputs = toArray(visibleOptions.querySelectorAll('input'));
                    var values = [];

                    optionInputs.forEach(function (i) {
                        allChecked = allChecked && i.checked;
                        values.push(i.value);
                    });

                    if (!allChecked) {
                        this.select(values, false);
                    } else {
                        this.deselect(values, false);
                    }

                    this.options.onChange(optionInputs, !allChecked);
                }.bind(this));
            }

            if (this.options.enableCollapsibleOptGroups && this.options.multiple) {
                var lis = this.ul.querySelectorAll("li.multiselect-group");
                siblings(lis).filter(function (s) {
                    return !(matches(s, "li.multiselect-group") || matches(s, "li.multiselect-all"));
                }).forEach(function (l) {
                    toggleClass(l, 'hidden', true);
                });

                this.ul.addEventListener('click', function (event) {
                    if (matches(event.target, "li.multiselect-group")) event.stopPropagation();
                })

                this.ul.addEventListener('click', function (event) {
                    if (matches(event.target, 'li.multiselect-group a > b')) {
                        event.stopPropagation();

                        var n = getNearest(event.target, 'li');
                        var r = nextUntil(n, "li.multiselect-group");
                        var i = true;

                        r.forEach(function (el) {
                            i = i && hasClass(el, 'hidden');
                        });

                        r.forEach(function (el) {
                            toggleClass(el, 'hidden', !i);
                        });
                    }
                });

                this.ul.on("change", function (event) {
                    if (matches(event.target, "li.multiselect-group > a > input")) {
                        event.stopPropagation();

                        var n = getNearest(event.target, 'li');
                        var r = nextUntil(n, "li.multiselect-group", function (el) {
                            return !hasClass("disabled");
                        });
                        var s = toArray(r.querySelectorAll("input"));

                        var i = true;
                        s.forEach(function (el) {
                            i = i && el.checked;
                        });

                        s.checked = !i;

                        s.dispatchEvent(new Event("change"));
                    }
                });

                // Set the initial selection state of the groups.
                toArray(this.ul.querySelectorAll("li.multiselect-group")).forEach(function (li) {
                    var r = nextUntil(li, "li.multiselect-group", function (el) {
                        return !hasClass("disabled");
                    });
                    var s = toArray(r.getElementsByTagName("input"));

                    var i = true;
                    s.forEach(function (el) {
                        i = i && el.checked;
                    });

                    toArray(el.getElementsByTagName('input')).forEach(function (node) {
                        node.checked = i;
                    });
                });

                // Update the group checkbox based on new selections among the
                // corresponding children.
                this.ul.addEventListener("change", function (event) {
                    if (matches(event.target, "li input")) {
                        event.stopPropagation();
                        var n = getNearest(t.target, 'li');
                        var r1 = prevUntil(n, "li.multiselect-group", function (el) {
                            return !hasClass(el, "disabled");
                        });
                        var r2 = nextUntil(n, "li.multiselect-group", function (el) {
                            return !hasClass(el, "disabled");
                        });
                        var s1 = toArray(r1.getElementsByTagName("input"));
                        var s2 = toArray(r2.getElementsByTagName("input"));

                        var i = eventt.target.checked;
                        s1.forEach(function (el) {
                            i = i && el.checked;
                        });

                        s2.forEach(function (el) {
                            i = i && el.checked;
                        });

                        prevAll(n, '.multiselect-group').reduce(function (agg, value) {
                            return agg.concat(toArray(value.getElementsByTagName('input')));
                        }, []).forEach(function (iEl) {
                            iEl.checked = i;
                        });
                    }
                });

                toArray(this.ul.querySelectorAll("li.multiselect-all")).forEach(function (el) {
                    el.style.background = '#f3f3f3';
                    el.style.borderBottom = '1px solid #eaeaea';
                });
                toArray(this.ul.querySelectorAll("li.multiselect-group > a, li.multiselect-all > a > label.checkbox")).forEach(function (el) {
                    el.style.padding = '3px 20px 3px 35px';
                });
                toArray(this.ul.querySelectorAll("li.multiselect-group > a > input")).forEach(function (el) {
                    el.style.margin = '4px 0px 5px -20px';
                });
            }
        },

        /**
         * Create an option using the given select option.
         *
         * @param {Node} element
         */
        createOptionValue: function (element) {
            // Support the label attribute on options.
            var label = this.options.optionLabel(element);
            var classes = this.options.optionClass(element);
            var value = element.value;
            var inputType = this.options.multiple ? "checkbox" : "radio";

            var li = createElement(this.options.templates.li);
            var labelEL = toArray(li.getElementsByTagName('label'))[0];
            addClass(labelEL, inputType);
            addClass(li, classes);

            if (this.options.enableHTML) {
                labelEL.innerHTML = " " + label;
            } else {
                labelEL.textContent = " " + label;
            }

            var checkbox = createElement('<input/>');
            checkbox.setAttribute('type', inputType);

            if (this.options.checkboxName) {
                checkbox.setAttribute('name', this.options.checkboxName);
            }
            labelEL.insertBefore(checkbox, labelEL.firstChild);

            var selected = element.selected || false;
            checkbox.value = value;

            if (value === this.options.selectAllValue) {
                addClass(li, "multiselect-item multiselect-all");
                addClass(checkbox.parentNode.parentNode, 'multiselect-all');
            }

            labelEL.setAttribute('title', element.getAttribute('title'));

            this.ul.appendChild(li);

            if (element.disabled) {
                checkbox.setAttribute('disabled', 'disabled');
                var a = getNearest(checkbox, 'a');
                a.setAttribute('tabindex', "-1");

                var li = getNearest(a, "li");
                addClass(li, "disabled");
            }

            checkbox.checked = selected;

            if (selected && this.options.selectedClass) {
                addClass(getNearest(checkbox, 'li'), this.options.selectedClass);
            }
        },

        /**
         * Creates a divider using the given select option.
         *
         * @param {Node} element
         */
        createDivider: function (element) {
            var divider = createElement(this.options.templates.divider);
            this.ul.appendChild(divider);
        },

        /**
         * Creates an optgroup.
         *
         * @param {Node} group
         */
        createOptgroup: function (group) {
            if (this.options.enableCollapsibleOptGroups && this.options.multiple) {
                var label = group.getAttribute("label");
                var value = group.getAttribute("value");
                var r = createElement('<li class="multiselect-item multiselect-group"><a href="javascript:void(0);"><input type="checkbox" value="' + value + '"/><b> ' + label + '<b class="caret"></b></b></a></li>');

                if (this.options.enableClickableOptGroups) {
                    addClass(r, "multiselect-group-clickable")
                }
                this.ul.appendChild(r);
                if (group.disabled) {
                    addClass(r, "disabled")
                }
                toArray(group.getElementsByTagName('option')).forEach(function (el) {
                    this.createOptionValue(el);
                }.bind(this));
            } else {
                var groupName = group.label;

                // Add a header for the group.
                var li = createElement(this.options.templates.liGroup);

                if (this.options.enableHTML) {
                    li.querySelector('label').innerHTML = groupName;
                } else {
                    li.querySelector('label').textContent = groupName;
                }

                if (this.options.enableClickableOptGroups) {
                    addClass(li, 'multiselect-group-clickable');
                }

                this.ul.appendChild(li);

                if (group.disabled) {
                    addClass(li, 'disabled');
                }

                // Add the options of the group.
                toArray(group.getElementsByTagName('option')).forEach(function (o) {
                    this.createOptionValue(o);
                }.bind(this));
            }
        },

        /**
         * Build the select all.
         *
         * Checks if a select all has already been created.
         */
        buildSelectAll: function () {
            if (typeof this.options.selectAllValue === 'number') {
                this.options.selectAllValue = this.options.selectAllValue.toString();
            }

            var alreadyHasSelectAll = this.hasSelectAll();

            if (!alreadyHasSelectAll && this.options.includeSelectAllOption && this.options.multiple &&
                this.select.getElementsByTagName('option').length > this.options.includeSelectAllIfMoreThan) {

                // Check whether to add a divider after the select all.
                if (this.options.includeSelectAllDivider) {
                    this.ul.insertBefore(createElement(this.options.templates.divider), this.ul.firstChild);
                }

                var li = createElement(this.options.templates.li);
                addClass(li.querySelector("label"), "checkbox");

                if (this.options.enableHTML) {
                    li.querySelector("label").innerHTML = " " + this.options.selectAllText;
                } else {
                    li.querySelector("label").textContent = " " + this.options.selectAllText;
                }

                var label = li.querySelector("label")
                if (this.options.selectAllName) {
                    label.insertBefore(createElement('<input type="checkbox" name="' + this.options.selectAllName + '" />'), label.firstChild);
                } else {
                    label.insertBefore(createElement('<input type="checkbox" />', label.firstChild));
                }

                var checkbox = li.querySelector('input');
                checkbox.value = this.options.selectAllValue;

                addClass(li, "multiselect-item multiselect-all");
                addClass(checkbox.parentNode.parentNode, "multiselect-all");

                this.ul.insertBefore(li, this.ul.firstChild);

                checkbox.checked = false;
            }
        },

        /**
         * Builds the filter.
         */
        buildFilter: function () {

            // Build filter if filtering OR case insensitive filtering is enabled and the number of options exceeds (or equals) enableFilterLength.
            if (this.options.enableFiltering || this.options.enableCaseInsensitiveFiltering) {
                var enableFilterLength = Math.max(this.options.enableFiltering, this.options.enableCaseInsensitiveFiltering);

                if (this.select.querySelectorAll('option').length >= enableFilterLength) {

                    this.filter = createElement(this.options.templates.filter);
                    this.filter.querySelector('input').setAttribute('placeholder', this.options.filterPlaceholder);

                    // Adds optional filter clear button
                    if (this.options.includeFilterClearBtn) {
                        var clearBtn = createElement(this.options.templates.filterClearBtn);
                        clearBtn.addEventListener('click', function (event) {
                            clearTimeout(this.searchTimeout);
                            this.filter.querySelector('.multiselect-search').value = '';
                            toArray(this.ul.getElementsByTagName('li')).forEach(function (l) {
                                l.style.display = '';
                                removeClass(l, "filter-hidden");
                            });
                            this.updateSelectAll();
                        }.bind(this));
                        this.filter.querySelector('.input-group').appendChild(clearBtn);
                    }

                    this.ul.insertBefore(this.filter, this.ul.firstChild);

                    this.filter.value = this.query
                    this.filter.addEventListener('click', function (event) {
                        event.stopPropagation();
                    });
                    ['input', 'keydown'].forEach(function (eventName) {
                        this.filter.addEventListener(eventName, function (event) {
                            // Cancel enter key default behaviour
                            if (event.which === 13) {
                                event.preventDefault();
                            }

                            // This is useful to catch "keydown" events after the browser has updated the control.
                            clearTimeout(this.searchTimeout);

                            this.searchTimeout = this.asyncFunction(function () {

                                if (this.query !== event.target.value) {
                                    this.query = event.target.value;

                                    var currentGroup, currentGroupVisible;
                                    toArray(this.ul.getElementsByTagName('li')).forEach(function (l) {
                                        var value = element.getElementsByTagName('input').length > 0 ? element.querySelector('input').value : "";
                                        var text = element.querySelector('label').textContent;

                                        var filterCandidate = '';
                                        if ((this.options.filterBehavior === 'text')) {
                                            filterCandidate = text;
                                        } else if ((this.options.filterBehavior === 'value')) {
                                            filterCandidate = value;
                                        } else if (this.options.filterBehavior === 'both') {
                                            filterCandidate = text + '\n' + value;
                                        }

                                        if (value !== this.options.selectAllValue && text) {

                                            // By default lets assume that element is not
                                            // interesting for this search.
                                            var showElement = false;

                                            if (this.options.enableCaseInsensitiveFiltering) {
                                                filterCandidate = filterCandidate.toLowerCase();
                                                this.query = this.query.toLowerCase();
                                            }

                                            if (this.options.enableFullValueFiltering && this.options.filterBehavior !== 'both') {
                                                var valueToMatch = filterCandidate.trim().substring(0, this.query.length);
                                                if (this.query.indexOf(valueToMatch) > -1) {
                                                    showElement = true;
                                                }
                                            } else if (filterCandidate.indexOf(this.query) > -1) {
                                                showElement = true;
                                            }

                                            // Toggle current element (group or group item) according to showElement boolean.
                                            if (showElement) {
                                                element.style.display = '';
                                            } else {
                                                element.style.display = 'none';
                                            }
                                            toggleClass(element, 'filter-hidden', !showElement);

                                            // Differentiate groups and group items.
                                            if (hasClass(element, 'multiselect-group')) {
                                                // Remember group status.
                                                currentGroup = element;
                                                currentGroupVisible = showElement;
                                            } else {
                                                // Show group name when at least one of its items is visible.
                                                if (showElement) {
                                                    currentGroup.style.display = '';
                                                    removeClass(currentGroup, 'filter-hidden');
                                                }

                                                // Show all group items when group name satisfies filter.
                                                if (!showElement && currentGroupVisible) {
                                                    element.style.display = '';
                                                    removeClass(element, 'filter-hidden');
                                                }
                                            }
                                        }
                                    }.bind(this));
                                }

                                this.updateSelectAll();
                            }.bind(this), 300, this);
                        }.bind(this));
                    }.bind(this));
                }
            }
        },

        /**
         * Unbinds the whole plugin.
         */
        destroy: function () {
            container.parentNode.removeChild(container);
            this.select.style.display = '';
            this.select.setAttribute('data-multiselect', null);
        },

        /**
         * Refreshs the multiselect based on the selected options of the select.
         */
        refresh: function () {
            var inputs = this.ul.querySelectorAll('li input');

            toArray(this.select.getElementsByTagName('option')).forEach(function (o) {
                var elem = element;
                var value = elem.value;
                var input;
                for (var i = inputs.length; 0 < i--; /**/ ) {
                    if (value !== (input = inputs[i]).value)
                        continue; // wrong li

                    if (elem.selected) {
                        input.checked = true;

                        if (this.options.selectedClass) {
                            addClass(getNearest(input, 'li'), this.options.selectedClass);
                        }
                    } else {
                        input.checked = false;

                        if (this.options.selectedClass) {
                            removeClass(getNearest(input, 'li'), this.options.selectedClass);
                        }
                    }

                    if (elem.disabled) {
                        input.setAttribute('disabled', 'disabled')
                        input.disabled = true
                        addClass(getNearest(input, 'li'), 'disabled');
                    } else {
                        input.disabled = false
                        removeClass(getNearest(input, 'li'), 'disabled');
                    }
                    break; // assumes unique values
                }
            }.bind(this));

            this.updateButtonText();
            this.updateSelectAll();
        },

        /**
         * Select all options of the given values.
         *
         * If triggerOnChange is set to true, the on change event is triggered if
         * and only if one value is passed.
         *
         * @param {Array} selectValues
         * @param {Boolean} triggerOnChange
         */
        select: function (selectValues, triggerOnChange) {
            if (!Array.isArray(selectValues)) {
                selectValues = [selectValues];
            }

            for (var i = 0; i < selectValues.length; i++) {
                var value = selectValues[i];

                if (value === null || value === undefined) {
                    continue;
                }

                var option = this.getOptionByValue(value);
                var checkbox = this.getInputByValue(value);

                if (option === undefined || checkbox === undefined) {
                    continue;
                }

                if (!this.options.multiple) {
                    this.deselectAll(false);
                }

                if (this.options.selectedClass) {
                    addClass(getNearest(checkbox, 'li'), this.options.selectedClass);
                }

                checkbox.checked = true;
                option.selected = true;

                if (triggerOnChange) {
                    this.options.onChange(option, true);
                }
            }

            this.updateButtonText();
            this.updateSelectAll();
        },

        /**
         * Clears all selected items.
         */
        clearSelection: function () {
            this.deselectAll(false);
            this.updateButtonText();
            this.updateSelectAll();
        },

        /**
         * Deselects all options of the given values.
         *
         * If triggerOnChange is set to true, the on change event is triggered, if
         * and only if one value is passed.
         *
         * @param {Array} deselectValues
         * @param {Boolean} triggerOnChange
         */
        deselect: function (deselectValues, triggerOnChange) {
            if (!Array.isArray(deselectValues)) {
                deselectValues = [deselectValues];
            }

            for (var i = 0; i < deselectValues.length; i++) {
                var value = deselectValues[i];

                if (value === null || value === undefined) {
                    continue;
                }

                var option = this.getOptionByValue(value);
                var checkbox = this.getInputByValue(value);

                if (option === undefined || checkbox === undefined) {
                    continue;
                }

                if (this.options.selectedClass) {
                    removeClass(getNearest(checkbox, 'li'), this.options.selectedClass);
                }

                checkbox.checked = false;
                option.selected = false;

                if (triggerOnChange) {
                    this.options.onChange(option, false);
                }
            }

            this.updateButtonText();
            this.updateSelectAll();
        },

        /**
         * Selects all enabled & visible options.
         *
         * If justVisible is true or not specified, only visible options are selected.
         *
         * @param {Boolean} justVisible
         * @param {Boolean} triggerOnSelectAll
         */
        selectAll: function (justVisible, triggerOnSelectAll) {
            justVisible = (this.options.enableCollapsibleOptGroups && this.options.multiple) ? false : justVisible;

            var justVisible = typeof justVisible === 'undefined' ? true : justVisible;

            var allCheckboxes = toArray(this.ul.querySelectorAll("li input[type='checkbox']")).filter(function (c) {
                return !c.disabled;
            });
            var visibleCheckboxes = allCheckboxes.filter(function (c) {
                return isVisible(c);
            });
            var allCheckboxesCount = allCheckboxes.length;
            var visibleCheckboxesCount = visibleCheckboxes.length;

            if (justVisible) {
                visibleCheckboxes.forEach(function (c) {
                    c.checked = true;
                });
                toArray(this.ul.getElementsByTagName('li')).filter(function (l) {
                    return !(hasClass(l, 'divider') || hasClass(l, 'disabled'));
                }).filter(function (l) {
                    return isVisible(l);
                }).forEach(function (l) {
                    addClass(l, this.options.selectedClass);
                });
            } else {
                allCheckboxes.forEach(function (c) {
                    c.checked = true;
                });
                toArray(this.ul.getElementsByTagName('li')).filter(function (l) {
                    return !(hasClass(l, 'divider') || hasClass(l, 'disabled'));
                }).forEach(function (l) {
                    addClass(l, this.options.selectedClass);
                });
            }

            if (allCheckboxesCount === visibleCheckboxesCount || justVisible === false) {
                toArray(this.select.getElementsByTagName('option')).filter(function (o) {
                    return !matches(o, "[data-role='divider']") && !o.disabled;
                }).forEach(function (o) {
                    o.selected = true;
                });
            } else {
                var values = visibleCheckboxes.map(function (c) {
                    return c.value;
                });

                toArray(this.select.getElementsByTagName('option')).filter(function (o) {
                    return !o.disabled && values.indexOf(o.value) > -1;
                }).forEach(function (o) {
                    o.selected = true;
                });
            }

            if (triggerOnSelectAll) {
                this.options.onSelectAll();
            }
        },

        /**
         * Deselects all options.
         *
         * If justVisible is true or not specified, only visible options are deselected.
         *
         * @param {Boolean} justVisible
         */
        deselectAll: function (justVisible) {
            justVisible = (this.options.enableCollapsibleOptGroups && this.options.multiple) ? false : justVisible;
            justVisible = typeof justVisible === 'undefined' ? true : justVisible;

            if (justVisible) {
                var visibleCheckboxes = toArray(this.ul.querySelectorAll("li input[type='checkbox']")).filter(function (cb) {
                    return !checkbox.disabled && isVisible(cb);
                });
                visibleCheckboxes.forEach(function (cb) {
                    cb.checked = false;
                });

                var values = visibleCheckboxes.map(function (cb) {
                    return cb.value;
                });

                toArray(this.select.getElementsByTagName("option")).filter(function (o, index) {
                    return !o.disabled && values.indexOf(o.value) > -1;
                }).forEach(function (o) {
                    o.selected = false;
                });

                if (this.options.selectedClass) {
                    toArray(this.ul.getElementsByTagName("li")).filter(function (li) {
                        return !hasClass(li, "disabled") && !hasClass("divider") && isVisible(li);
                    }).forEach(function (li) {
                        removeClass(li, this.options.selectedClass);
                    }.bind(this));
                }
            } else {
                toArray(this.ul.querySelectorAll("li input[type='checkbox']")).filter(function (cb) {
                    !cb.disabled
                }).forEach(function (cb) {
                    cb.checked = false
                });

                toArray(this.select.getElementsByTagName('option')).filter(function (o) {
                    return !o.disabled;
                }).forEach(function (o) {
                    o.selected = false
                });

                if (this.options.selectedClass) {
                    toArray(this.ul.getElementsByTagName("li")).filter(function (li) {
                        return !hasClass("divider") && !hasClass("disabled");
                    }).forEach(function (li) {
                        removeClass(li, this.options.selectedClass);
                    }.bind(this));
                }
            }
        },

        /**
         * Rebuild the plugin.
         *
         * Rebuilds the dropdown, the filter and the select all option.
         */
        rebuild: function () {
            this.ul.innerHTML = '';

            // Important to distinguish between radios and checkboxes.
            this.options.multiple = this.select.setAttribute('multiple', "multiple");

            this.buildSelectAll();
            this.buildDropdownOptions();
            this.buildFilter();

            this.updateButtonText();
            this.updateSelectAll(true);

            this.select.getElementsByTagName('option')
            if (this.options.disableIfEmpty && this.select.getElementsByTagName('option').length <= 0) {
                this.disable();
            } else {
                this.enable();
            }

            if (this.options.dropRight) {
                addClass(this.ul, 'pull-right');
            }
        },

        /**
         * The provided data will be used to build the dropdown.
         */
        dataprovider: function (dataprovider) {

            var groupCounter = 0;
            var select = this.select.innerHTML = '';

            dataprovider.forEach(function (option, index) {
                var tag;

                if (Array.isArray(option.children)) { // create optiongroup tag
                    groupCounter++;

                    tag = createElement('<optgroup><optgroup/>');
                    tag.setAttribute("label", option.label || 'Group ' + groupCounter);
                    tag.setAttribute("disabled", !!option.disabled);

                    option.children.forEach(function (subOption) { // add children option tags
                        var o = createElement('<option></option>');
                        o.setAttribute("value", subOption.value);
                        o.setAttribute("label", subOption.label || subOption.value);
                        o.setAttribute("title", subOption.title);
                        o.setAttribute("selected", !!subOption.selected);
                        o.setAttribute("disabled", !!subOption.disabled);
                        tag.appendChild(o);
                    });
                } else {
                    var tag = createElement('<option></option>');
                    tag.setAttribute("value", option.value);
                    tag.setAttribute("label", option.label || option.value);
                    tag.setAttribute("title", option.title);
                    tag.setAttribute("class", option.class);
                    tag.setAttribute("selected", !!option.selected);
                    tag.setAttribute("disabled", !!option.disabled);

                    tag.textContent = option.label || option.value;
                }

                select.appendChild(tag);
            });

            this.rebuild();
        },

        /**
         * Enable the multiselect.
         */
        enable: function () {
            this.select.disabled = false;
            this.button.disabled = false;
            removeClass(this.button, 'disabled');
        },

        /**
         * Disable the multiselect.
         */
        disable: function () {
            this.select.disabled = true;
            this.button.disabled = true;
            addClass(this.button, 'disabled');
        },

        /**
         * Set the options.
         *
         * @param {Array} options
         */
        setOptions: function (options) {
            this.options = this.mergeOptions(options);
        },

        /**
         * Merges the given options with the default options.
         *
         * @param {Array} options
         * @returns {Array}
         */
        mergeOptions: function (options) {
            return deepmerge.all([{}, this.defaults || {}, this.options || {}, options || {}]);
        },

        /**
         * Checks whether a select all checkbox is present.
         *
         * @returns {Boolean}
         */
        hasSelectAll: function () {
            return this.ul.querySelectorAll('li.multiselect-all').length > 0;
        },

        /**
         * Updates the select all checkbox based on the currently displayed and selected checkboxes.
         */
        updateSelectAll: function (notTriggerOnSelectAll) {
            if (this.hasSelectAll()) {
                var allBoxes = toArray(this.ul.getElementsByTagName('li')).filter(function (li) {
                    return !hasClass('multiselect-item') && !hasClass('filter-hidden');
                }).reduce(function (acc, li) {
                    var inputs = toArray(li.getElementsByTagName('input')).filter(function (i) {
                        return !input.disabled;
                    });
                    return acc.concat(inputs)
                }, []);
                var allBoxesLength = allBoxes.length;
                var checkedBoxesLength = allBoxes.filter(function (i) {
                    return i.checked;
                }).length;
                var selectAllLi = toArray(this.ul.querySelectorAll('li.multiselect-all'));
                var selectAllInput = selectAllLi.reduce(function (acc, li) {
                    var inputs = toArray(li.getElementsByTagName('input'));
                    return acc.concat(inputs)
                }, []);

                if (checkedBoxesLength > 0 && checkedBoxesLength === allBoxesLength) {
                    selectAllInput.forEach(function (i) {
                        i.checked = true;
                    });
                    selectAllLi.forEach(function (li) {
                        addClass(li, this.options.selectedClass);
                    }.bind(this));
                    this.options.onSelectAll(true);
                } else {
                    selectAllInput.forEach(function (i) {
                        i.checked = false;
                    });
                    selectAllLi.forEach(function (li) {
                        removeClass(li, this.options.selectedClass);
                    }.bind(this));
                    if (checkedBoxesLength === 0) {
                        if (!notTriggerOnSelectAll) {
                            this.options.onSelectAll(false);
                        }
                    }
                }
            }
        },

        /**
         * Update the button text and its title based on the currently selected options.
         */
        updateButtonText: function () {
            var options = this.getSelected();

            // First update the displayed button text.
            if (this.options.enableHTML) {
                toArray(this.container.querySelectorAll('.multiselect .multiselect-selected-text')).forEach(function (el) {
                    el.innerHTML = this.options.buttonText(options, this.select);
                }.bind(this));
            } else {
                toArray(this.container.querySelectorAll('.multiselect .multiselect-selected-text')).forEach(function (el) {
                    el.textContent = this.options.buttonText(options, this.select);
                }.bind(this));
            }

            // Now update the title attribute of the button.
            toArray(this.container.querySelectorAll('.multiselect')).forEach(function (el) {
                console.log("OPTIONS", options)
                console.log("TITLE", this.options.buttonTitle(options, this.select))
                el.setAttribute('title', this.options.buttonTitle(options, this.select))
            }.bind(this))
        },

        /**
         * Get all selected options.
         *
         * @returns {jQUery}
         */
        getSelected: function () {
            return toArray(this.select.getElementsByTagName('option')).filter(function (o) {
                return o.selected = true;
            });
        },

        /**
         * Gets a select option by its value.
         *
         * @param {String} value
         * @returns {Node}
         */
        getOptionByValue: function (value) {
            var options = this.select.getElementsByTagName('option');
            var valueToCompare = value.toString();

            for (var i = 0; i < options.length; i = i + 1) {
                var option = options[i];
                if (option.value === valueToCompare) {
                    return option;
                }
            }
        },

        /**
         * Get the input (radio/checkbox) by its value.
         *
         * @param {String} value
         * @returns {Node}
         */
        getInputByValue: function (value) {
            var checkboxes = this.ul.querySelectorAll('li input');
            var valueToCompare = value.toString();

            for (var i = 0; i < checkboxes.length; i = i + 1) {
                var checkbox = checkboxes[i];
                if (checkbox.value === valueToCompare) {
                    return checkbox;
                }
            }
        },

        asyncFunction: function (callback, timeout, self) {
            var args = toArray(arguments, 3);
            return setTimeout(function () {
                callback.apply(self || window, args);
            }, timeout);
        },

        setAllSelectedText: function (allSelectedText) {
            this.options.allSelectedText = allSelectedText;
            this.updateButtonText();
        }
    };

    var multiselect = window.multiselect = function (el, option, parameter, extraOptions) {
        if (!el) return;
        var data = el.getAttribute('data-multiselect');
        var options = typeof option === 'object' && option;

        // Initialize the multiselect.
        if (!data) {
            data = new Multiselect(el, options);
            el.setAttribute('data-multiselect', JSON.stringify(data));
        }

        // Call multiselect method.
        if (typeof option === 'string') {
            data[option](parameter, extraOptions);

            if (option === 'destroy') {
                el.setAttribute('data-multiselect', false);
            }
        }

        console.log(el);
    };

    var ready = function () {
        toArray(document.querySelectorAll('select[data-role=multiselect]')).forEach(function (el) {
            multiselect(el);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ready);
    } else {
        ready();
    }

}();