# Fruit Punch JavaScript Game

![image](https://user-images.githubusercontent.com/63067781/192017692-39cc9edf-cc6f-4066-b695-434ead2edaca.png)
<br />
<br />
Fruit Punch is a game built with Vanilla JavaScript. Similar to Candy Crush, to get points a player must match at least 3 items in a row or column. When the items are matched, they disappear to make room for new items. The player can only switch two items when one is above, below, left, or right of another item. Diagonal moves are not allowed. When a player accumulates the target amount of points they progress to the next level. Each time the game progresses to the next level the number of moves available decreases, the points target increases, and a different type of item is added to the group of items to increase the matching difficulty. The player loses the game if they run out of moves before a level is complete. The player wins if all levels of the game are completed. 

## Tech Stack

JavaScript<br />
CSS<br />
HTML<br />

# Challenges

The most challenging part of this project became understanding the event loop and how it relates to rendering. I wanted there to be fluid animation so the player/user could understand what was happening in the game, instead of the items just magically appearing from nowhere or instantly becoming something else. As someone only familiar with the basics of JavaScript at the beginning of this project, it proved to be more of a challenge than initially expected. Understanding where the setTimeout() method, Promise objects, and rendering fit in the event loop helped me figure out why it looked like my animations weren't working. It wasn't a bug! It was just the event loop doing what it was designed to do.
<br />
<br />
![image](https://user-images.githubusercontent.com/63067781/192014137-c48240d2-442b-47a2-80a7-bce31342c2a2.png)
<br />
[Video - Jake Archibald: In The Loop](https://youtu.be/cCOL7MC4Pl0)

## :notebook: Things To Work On

* [x] Conquer Event Loop 
* [ ] Clean Up Code
* [ ] Constructor for Modal
* [ ] Change setTimeout to Promises
* [ ] Test out animation for drag and drop element switching
* [ ] Add a button that solves the game for you
* [ ] Add touch events
* [ ] Add keyboard accessibility
* [ ] Gradient changes on the progress bar

## Credits

[Fruit Images - Image by titusurya on Freepik](https://www.freepik.com/free-vector/coloured-fruit-icons_942941.htm#page=2&position=39&from_view=undefined)<br />
[Tropical Background - Image by pikisuperstar on Freepik](https://www.freepik.com/free-vector/tropical-landscape-background-zoom_9146948.htm#&position=1&from_view=undefined)<br />
[Bookman JF Font](https://fonts.adobe.com/fonts/bookman-jf)<br />
[How To CSS Glyphs & Swashes or "Unleash Hidden Gems in OpenType fonts"](https://blog.adobe.com/en/publish/2018/07/02/unleash-hidden-gems-opentype-fonts)<br />
[Jake Archibald: In The Loop](https://youtu.be/cCOL7MC4Pl0)

## Contribute
Not currently looking for contributors, since this is a personal project meant to improve my JavaScript skills. However, helpful 
and constructive suggestions are always welcome.

## License
[MIT](https://choosealicense.com/licenses/mit/)
