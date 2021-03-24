import os
import time
import random
# import ktrain

from flask import Flask
from flask import request
from flask import render_template
from flask_cors import CORS, cross_origin

app = Flask(__name__)

DOMAIN_MAP = {"beer": "Beer", "visa": "Visa", "movies": "Movies"}
INDEX_DIR_MAP = {"beer": "beer wali", "visa": "visa wali", "movies": "war"}

@app.route('/chat')
def chat():
  return render_template('index.html', domains=DOMAIN_MAP, current="beer")


@app.route('/response', methods=["POST"])
@cross_origin()
def find_response():
  params = request.get_json()
  print(params)
  return({
    "data": query_qa(params),
    "modal_id": generate_random_id(),
    "success": True
    })



def formulate_query(params):
  query = preprocess_query(params['query'])
  print("PRE", query)

  if params['use_context']=="1" and type(params['context'])==dict:
    context_string = " for "
    for key, value in params['context'].items():
      context_string += str(key) + " " + str(value) + " and "
    
    query = query + context_string[0:-5] + " ?"
    print("context string", context_string)
    return query
  else:
    return query

def preprocess_query(query):
  if query[-1]!="?":
    return query
  else:
    return query[0:-1]


def process_answers(answers, params):
  return [
            {"Answer": "This is answer", "Context": "This is my full context", "Confidence": 0.95},
            {"Answer": "answer", "Context": "This is my another full context", "Confidence": 0.90},
            {"Answer": "answer", "Context": "This is my another full context", "Confidence": 0.80}
          ]

def query_qa(params):
  index_dir = INDEX_DIR_MAP[params['domain']]
  if index_dir:
    # qa      = text.SimpleQA(index_dir)
    query   = formulate_query(params)
    print("Query: ", query)
    # answers = qa.ask(query)
    print("Index dir: ", index_dir)
    return process_answers(answers = [], params = params)
  else:
    return []

def generate_random_id():
  return ( str(int(time.time())) + str(int(random.uniform(1, 100))) )

if __name__ == "__main__":
    app.run(debug=True)