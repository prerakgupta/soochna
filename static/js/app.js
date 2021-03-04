  function getFormData(){
    var form = $("#all_settings")
    var unindexed_array = form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    indexed_array['query'] = $("#input_query")[0].value;

    try {
      parsed_context = indexed_array['context'] ? JSON.parse(indexed_array['context']) : {}
      indexed_array['context'] = parsed_context;
      console.log(indexed_array);
      return indexed_array;
    }
    catch (error) {
      if (error instanceof SyntaxError) {
          showError("There is a syntax error. Please correct it and try again: " + error.message);
          return ;
      }
      else {
          showError("An unexpected error occured.");
          throw error;
      }
    }
  }

  function addUserQueryToDiv(query){
    $(".chat_area").append("<div class='user_message'><img src='/static/images/user.png' alt='User Avatar' class='user_avatar'><p class='message'>"+query+"</p></div>");
  }

  function addBotResponseToDiv(modalId, answer, multiple){
    BotResponseDiv = "<div class='bot_message'>";
    BotResponseDiv += "<img src='/static/images/bot.jpg' alt='Bot Avatar' class='bot_avatar'>";
    BotResponseDiv += "<p class='message'>"+answer+"</p>";
    if(multiple){
      BotResponseDiv += "<span class='show_more'><a href='#' class='small_message' onclick='showMore("+modalId+")'>Show more</a></span>";
    }
    BotResponseDiv += "</div>";
    $(".chat_area").append(BotResponseDiv);
    $(".chat_area").scrollTop($(".chat_area")[0].scrollHeight);
  }

  function getActiveIdAndResponse(resp){
    if(resp.data && resp.data.length>0){
      var modal_id = resp.modal_id;
      var answer = resp.data[0].Answer;
    }
    else{
      var modal_id = Date.now();
      var answer = "Sorry I could not find anything relevant."
    }
    return [modal_id, answer];
  }

  function showMore(el){
    $("#"+el).show();
  }

  function showError(error_message){
    $("#error_div").append("<p class='error'>"+error_message+"</p>")
    $("#error_div").show()
    setTimeout(function(){
      $("#error_div").hide()
      $("#error_div").html('')
    }, 4000) 
  }

  function onQueryChange(event){
    var key = window.event.keyCode;
    if (key === 13) {
      $(".lds-roller").show();
      var user_query = $("#input_query")[0].value;
      if (user_query.length > 5){
        addUserQueryToDiv(user_query);

        
        $.ajax({
          type: "POST",
          url: "/response",
          contentType: "application/json",
          dataType: "json",
          headers: {
            "accept": "application/json",
            "Access-Control-Allow-Headers": "Content-Type"
          },
          data: JSON.stringify(getFormData()),
          success: function(response){
            $(".lds-roller").hide();
            console.log(response);
            if(response.success && response.data){
              [modalId, answer] = getActiveIdAndResponse(response);
              $("#input_query")[0].value = '';
              addBotResponseToDiv(modalId, answer, (response.data.length>1));
              addMoreInfoPopup(response, modalId);
            }
            else{
              showError(response.message);
            }
          },
          error: function(response){
            $(".lds-roller").hide();
            showError("An error has occured. Make sure you have selected a domain.")
          }
        });
      }
      else{
        showError("The query is too small to process.");
      }
    }
  }


  function addMoreInfoPopup(response, modalId){

    popupWindowHTML = "<div class='modal_class' id="+modalId+" style='display: none;'>";
    popupWindowHTML += "<div class='modal_content'><table><tr><th>No.</th><th>Answer</th><th>Confidence</th></tr>";
    console.log(response.data);
    jQuery.each(response.data, function(index, resp) {
      popupWindowHTML += "<tr><td>"+index+"</td><td>"+resp.Answer+"</td><td>"+resp.Confidence+"</td></tr>";
    });
    popupWindowHTML += "<div class='popup_close_button' onclick='closePopup()'>X</div></div></div>"
    $("#more_info")[0].innerHTML += popupWindowHTML;
  }

  function closePopup(){
    $(".modal_class").hide();
  }

  function reset(){
    $(".chat_area")[0].innerHTML = "";
    $("#more_info")[0].innerHTML="";
    $(".info-box").show();
  }

  $("#show_settings").on('click', function(){
    $("#show_settings").hide();
    $("#all_settings").show();
    $("#hide_settings").show();
  });

  $("#hide_settings").on('click', function(){
    $("#hide_settings").hide();
    $("#all_settings").hide();
    $("#show_settings").show();
  });

  $(".nav_domains").on('click', function(el){
    var domain = el.currentTarget.getAttribute("href").substr(1, )
    $("#current_domain")[0].value = domain;
    var li_elements = el.currentTarget.parentElement.parentElement.getElementsByTagName("li");
    jQuery.each(li_elements, function(index, li) {
      li.getElementsByTagName("a")[0].style = "color: white";
    });
    el.currentTarget.style.color="#5294e2";
    reset();
  });




