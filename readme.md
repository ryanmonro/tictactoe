# Tic Tac Toe

Playable [here](https://ryanmonro.github.io/tictactoe/). 

## Approach
I first sorted out the model of the game (the game() object), and then made the game playable in the console. Then I created DOM elements to link to the game model. The game squares are div elements, each containing a canvas element, all within the main element. The canvas elements are where the noughts and  crosses are drawn. Once I had the animated hand-drawn noughts and crosses, I realised it would make a lot more sense if the game grid was hand-drawn too. Behind the main element is another canvas, where the lines for the board are drawn before play.

## Cool Tech 
### Animation!
There were a lot of things I wanted to animate, so I wrote a general function for it. Basically, each canvas drawing I want to animate is passed as a function to the animate() function. The animate() function does one thing: "Change this parameter of this function over this amount of time according to this curve, and do this other function when you're finished."
### Sound
I recorded audio of myself drawing noughts and crosses with a pencil and a whiteboard marker. This also helped inform how long it should take to draw these on the screen. It turns out that in real life I can draw a line in about 200ms.
### Curves
After about an hour of thinking and staring at graphs and wishing I could apply the maths I learned in high school to solve the problem of "how does the pencil accelerate when a human draws a circle?" I finally realised I wanted to mimic the ease-in-out behaviour of CSS transitions, and apply that to the speed of my animations. Google helped me do the rest once I knew "js easing equations" was what I needed to search for.

## Acknowledgements:

- Legal pad image from (https://pixabay.com/en/legal-pad-paper-pad-office-lined-979558/)

- Ease in/out equations from (http://gizma.com/easing/)

- Tada sound from Windows 3.1

- Draw sound from Family Feud circa 1994

