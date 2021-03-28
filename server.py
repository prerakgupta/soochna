import os
import time
import random
import ktrain
from ktrain import text

from flask import Flask
from flask import request
from flask import render_template
from flask_cors import CORS, cross_origin

app = Flask(__name__)
os.environ["CUDA_DEVICE_ORDER"]="PCI_BUS_ID";
os.environ["CUDA_VISIBLE_DEVICES"]="0" 

DOMAIN_MAP = {"beer": "Beer", "visa": "Study Visa"}
INDEX_DIR_MAP = {"beer": "/home/ubuntu/prerak/data/indexed/beer", "visa": "/home/ubuntu/prerak/data/indexed/study_visa"}

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


def process_answers(answers, threshold):
    response = []
    for answer in answers:
        conf = float(answer['confidence'])
        print(conf, threshold)
        if conf > threshold:
            response.append({"Answer": answer['answer'],"Confidence": round(conf, 2)})
    print("The final response is", response)
    return response

def query_qa(params):
  index_dir = INDEX_DIR_MAP[params['domain']]
  print("Index dir: ", index_dir)
  if index_dir:
    qa      = text.SimpleQA(index_dir)
    query   = formulate_query(params)
    print("Query: ", query)
    answers = qa.ask(query, batch_size=4)
    print("Answers are: ", type(answers), answers[0])
    return process_answers(answers = answers, threshold = float(params['thresh']))
  else:
    return []

def generate_random_id():
  return ( str(int(time.time())) + str(int(random.uniform(1, 100))) )

if __name__ == "__main__":
    app.run()
