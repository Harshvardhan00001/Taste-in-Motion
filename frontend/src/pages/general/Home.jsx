import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'

const Home = () => {
    const [videos, setVideos] = useState([])

    useEffect(() => {
        axios.get("http://localhost:3000/api/food", { withCredentials: true })
            .then(response => {
                setVideos(response.data.foodItems ?? [])
            })
            .catch(err => console.error("Feed error:", err.response?.status))
    }, [])

    async function likeVideo(item) {
        try {
            const response = await axios.post("http://localhost:3000/api/food/like",
                { foodId: item._id },
                { withCredentials: true }
            )
            const delta = response.data.like ? 1 : -1
            setVideos(prev => prev.map(v =>
                v._id === item._id
                    ? { ...v, likeCount: Math.max(0, (v.likeCount ?? 0) + delta), isLiked: response.data.like }
                    : v
            ))
        } catch (err) {
            console.error("Like error:", err.response?.status)
        }
    }

    async function saveVideo(item) {
        try {
            const response = await axios.post("http://localhost:3000/api/food/save",
                { foodId: item._id },
                { withCredentials: true }
            )
            const delta = response.data.save ? 1 : -1
            setVideos(prev => prev.map(v =>
                v._id === item._id
                    ? { ...v, savesCount: Math.max(0, (v.savesCount ?? 0) + delta), isSaved: response.data.save }
                    : v
            ))
        } catch (err) {
            console.error("Save error:", err.response?.status)
        }
    }

    return (
        <ReelFeed
            items={videos}
            onLike={likeVideo}
            onSave={saveVideo}
            emptyMessage="No videos available."
        />
    )
}

export default Home