import os, sys
from Build import Build_Python

code = Build_Python("Test")

exec(code)