# Fruit Punch Javascript Game

![image](https://user-images.githubusercontent.com/63067781/192017692-39cc9edf-cc6f-4066-b695-434ead2edaca.png)
<br />
<br />
Fruit Punch is a game built with Vanilla Javascript. Similar to Candy Crush, to get points a player must match atleast 3 items in a row or column. When the items are matched, they disappear to make room for new items. The player can only switch two items when one is above, below, left, or right of another item. Diagonal moves are not allowed. When a player accumalates the target amount of points they progress to the next level. Each time the game progresses to the next level the amount of moves available decreases, the points target increases, and a different type of item is added to the group of items in order to increase the matching difficulty. The player loses the game if the run out of moves before a level is complete. The player wins win all levels of the game are completed. 

## Tech Stack

Javascript<br />
CSS<br />
HTML<br />

# Challenges

The most challenging part of this project became understanding the event loop and how it relates to rendering. I really wanted there to be fluid animation so the player/user could understand what was happening in the game, instead of the items just magically appearing from nowhere or instantly becoming something else. As someone only familiar with the basics of Javascript in the beginning of this project it proved to be more of a challenge then initially expected. Understanding where the setTimeout() method,Promise objects, and rendering fit in the event loop helped me figure out why it looked like my animations weren't working. It wasn't a bug! It was just the event loop doing what it was suppose to do.
<br />
<br />
![image](https://user-images.githubusercontent.com/63067781/192014137-c48240d2-442b-47a2-80a7-bce31342c2a2.png)
<br />
[Video - Jake Archibald: In The Loop](https://youtu.be/cCOL7MC4Pl0)

## Credits

[Fruit Images - Image by titusurya on Freepik](https://www.freepik.com/free-vector/coloured-fruit-icons_942941.htm#page=2&position=39&from_view=undefined)<br />
[Tropical Background - Image by pikisuperstar on Freepik](https://www.freepik.com/free-vector/tropical-landscape-background-zoom_9146948.htm#&position=1&from_view=undefined)<br />
[Bookman JF Font](https://fonts.adobe.com/fonts/bookman-jf)<br />
[How To CSS Glyphs & Swashes or "Unleash Hidden Gems in OpenType fonts"](https://blog.adobe.com/en/publish/2018/07/02/unleash-hidden-gems-opentype-fonts)<br />
[Jake Archibald: In The Loop](https://youtu.be/cCOL7MC4Pl0)

## Contribute
Not currently looking for contributers, since this is a personal project meant to improve my javascript skills. However, helpful 
and constructive suggestions are always welcome.

## License
[MIT](https://choosealicense.com/licenses/mit/)
