/**
 *  @file Provides a simple way to render a js object of a particular format into a DOMElement
 *  @author jec006
 */

// create a closure so we don't muck up the global environment with functions ect.
(function () {
  // ------  define some private helper methods ------  //

  /**
   * takes an item and returns either its classname or its type if it has no class
   * @param item - any variable/item
   */
  var classname = function (item) {
    var rtype = typeof item;

    if(typeof(item.constructor.name) != 'undefined'){
      rtype = item.constructor.name;
    }

    return rtype;
  }

  var parseContent = function(content){
    switch (classname(content)) {
      case 'String' :
      case 'object' : //this is for older versions of IE that like to hide HTMLElements constructors
      case 'Array' :
        return content;
        break;
      case 'Object' :
        return Renderable.create(content);
    }
  }


  /**
   * Define a Renderable Class
   * @param tag - the tagName, e.g. div
   * @param attrs - the attributes for the item, must be the js version i.e. className not class
   * @param content - the content of the created element, either text, a renderable Object, a Renderable
   *                  or an array of renderable Objects or Renderables
   */
  var Renderable = function(tag, attrs, content){
    this.tag = tag;
    this.attrs = attrs;
    this.content = parseContent(content);
  }

  /**
   * Turn a renderable into a DOMElement
   */
  Renderable.prototype.render = function(){
    var el;

    // handle arrays separately as we will need to loop through and append the elements after the fact
    var localContent = false;
    if(classname(this.content) == 'Array'){
      //make sure we copy it to local
      localContent = this.content.splice(0, 0);
      this.content = '';
    }


    switch (this.tag) {
      case 'table' :
        //TODO: Implement this
        break;
      case 'list' :
        //TODO: Implement this
        break;
      case 'checkboxes' :
        //TODO: Implement this
        break;
      default:
        el = mCreate.createElement(this.tag, this.attrs, this.content);
        break;
    }

    // add in the items from content if content was an array
    if(localContent){

      for(var renderable in localContent){
        if(classname(renderable) == 'Renderable'){
          el.appendChild(renderable.render());
        } else {
          //try to parse the item, otherwise just try to append it
          var parsed = Renderable.create(renderable);
          if(parsed) {
            el.appendChild(parsed.render());
          } else {
            try {
              el.appendChild(renderable);
            } catch (err) {
              this.log(err.description);
            }
          }
        }
      }

    }

    //return the rendered DOMElement
    return el;
  };

  /**
   * Method for logging messages to console
   * arguments is passed unaltered to the console.log function should it exist
   *
   * You can turn off logging by setting Renderable.prototype.hideDebugging = true
   */
  Renderable.prototype.log = function(){
    if(!this.hideDebugging && typeof(window.console) != 'undefined' && typeof(window.console) == 'function'){
      console.log.apply(arguments);
    }
  }

  /**
   * Creates a Renderable from a renderable object
   * @param renderable - a renderable object
   * @return a Renderable or false on failure
   */
  Renderable.create = function(renderable) {
    switch (classname(renderable)) {
      case 'Array' :
        //at this level, we can't create a DOMElement without a container for the child elements
        var obj = {
          'tag' : 'div',
          'attributes' : {'className' : 'renderable-container'},
          'content' : renderable
        };
        return Renderable.create(obj);
        break;
      case 'Renderable' :
        return renderable;
        break;
      case 'Object' :
        if(renderable.tag) {
          return new Renderable(renderable.tag, renderable.attributes||[], renderable.content||'');
        }
        break;
    }

    //if we made it down here we couldn't create it so return an empty string to prevent breakage
    Renderable.prototype.log('Failure creating renderable', renderable);
    return '';
  }

  //declare this globally
  window.Renderable = Renderable;

 })();