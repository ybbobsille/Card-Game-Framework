def Build_Python(Game_Id, ):
    return f"""
import os, time
import Runtime

os.chdir("Games/{Game_Id}")

render, inputhander = Runtime.Startup()

escape = 0

frame_history = []

t = time.time()
delta = 0
while True and escape < 100: # main loop
    delta = time.time() - t
    t = time.time()

    inputhander.tick(delta)
    render.tick(delta)

    escape += 1
"""