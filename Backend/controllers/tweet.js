import { Tweet } from "../models/tweet.js";
import { User } from "../models/user.js";

export const newTweet = async (req, res, next) => {
  try {
    const { postedBy, text } = req.body;

    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "PostedBy and text fields are requied" });
    }

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user._id.toString() != req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const maxLen = 500;

    if (text.length > maxLen) {
      return res.status(400).json({ error: "Text char limit exceeded" });
    }

    const newPost = new Tweet({ postedBy, text });
    await newPost.save();

    res.status(201).json( newPost );
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const getTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return res.status(400).json({ error: "Post not found" });
    }

    res.status(200).json(tweet);
  } catch (error) {
    console.log(error);
  }
};

export const likeUnlike = async (req, res, next) => {
  try {
    const tweetId = req.params.id;
    const userId = req.user._id;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    const isTweetLikedByUser = tweet.likes.includes(userId);

    if (isTweetLikedByUser) {
      //Unlike tweet
      await Tweet.updateOne({ _id: tweetId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Tweet unliked successfully" });
    } else {
      //Like tweet
      tweet.likes.push(userId);
      await tweet.save();
      res.status(200).json({ message: "Tweet liked successfully" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTweet = async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    if (tweet.postedBy.toString() != req.user._id) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    await Tweet.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Tweet Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const replyToTweet = async(req, res, next) => {
    const {text} = req.body;
    const tweetId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if(!text){
        return res.status(400).json({error: "Text is required"})
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        return res.status(404).json({error: "Tweet not found"});
    }

    const reply = {userId, text, userProfilePic, username};

    tweet.replies.push(reply);
    await tweet.save();

    res.status(200).json( reply );
}
 
export const getFeedTweets = async(req, res, next) => {
    try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const following = user.following;

		const feedTweets = await Tweet.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

		res.status(200).json( feedTweets );
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

export const getUserTweet = async(req, res, next) => {
  const {username} = req.params;
  try {
    const user = await User.findOne({username});

    if(!user) {
      return res.status(404).json({error: "User not found"})
    }

    const posts = await Tweet.find({postedBy: user._id,}).sort({createdAt:-1});


    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}
