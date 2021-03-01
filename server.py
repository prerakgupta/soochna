from flask import Flask
from flask import request
from flask import render_template

app = Flask(__name__)

@app.route('/chat')
def chat():
  domains = ["Beer", "Visa", "Movies"]
  # app.logger.debug('A value for debugging')
  # app.logger.warning('A warning occurred (%d apples)', 42)
  # app.logger.error('An error occurred')
  return render_template('index.html', domains=domains)


@app.route('/response', methods=["POST"])
def query_response():
  print(request.form)
  return({
    "data": "Finally it works",
    "modal_id": 12,
    "success": True
    })

if __name__ == "__main__":
    app.run(debug=True)