
/*
Copyright (c) 2019 The Khronos Group Inc.
Use of this source code is governed by an MIT-style license that can be
found in the LICENSE.txt file.
*/


#ifdef GL_ES
precision mediump float;
#endif
void function(int i)
{
    return i;  // void function cannot return a value
}

void main()
{
    int i;
    function(i);
}


