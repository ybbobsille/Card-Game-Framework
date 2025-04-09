import os, json
import webview
from flask import Flask, render_template, redirect, send_from_directory, jsonify

class Server:
    app = Flask(__name__, static_folder="./static", template_folder="./html")

    def Package_Data(data: dict | list):
        response = jsonify(data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    @app.route("/file/<path:filename>")
    def serve_file(filename):
        return send_from_directory('', filename)

    @app.route("/")
    def Index():
        return render_template("Index.html",
            Game_Name="Test"
        )

class API:
    def Get_Window_HTML(self, win_type: str, Window_Id: int):
        if win_type == "testing":
            return {
                    "win_type": win_type,
                    "Window_Id": Window_Id,
                    "HTML":f"done loading: {Window_Id}"
                }

        html = ""
        with open(f"html/Windows/{win_type}.html", "r") as f:
            html = f.read()
        
        css = ""
        if os.path.isfile(f"static/css/Windows/{win_type}.css") == True:
            with open(f"static/css/Windows/{win_type}.css", "r") as f:
                css = f.read()
        
        return {
            "win_type": win_type,
            "Window_Id": Window_Id,
            "HTML":html,
            "Css":css
        }

    def Load(self, Game_Name: str):
        data = {}

        if os.path.isdir(f"Games/{Game_Name}") == False or os.path.isfile(f"Games/{Game_Name}/data.json") == False:
            return {}

        with open(f"Games/{Game_Name}/data.json", "r") as f:
            data = json.load(f)
            
        return data
    
    def Save(self, data, Game_Name: str):
        if os.path.isdir(f"Games/{Game_Name}") == False:
            os.makedirs(f"Games/{Game_Name}")
        
        with open(f"Games/{Game_Name}/data.json", "w") as f:
            json.dump(data, f, indent="    ")
            
    def Restart(self):
        global window
        os.startfile("Edit.py")
        window.destroy()

if __name__ == "__main__":
    global window
    api = API()
    server = Server()

    window = webview.create_window("test", server.app, http_port=56068, js_api=api, maximized=True)
    webview.start(debug=True, http_port=56068)
