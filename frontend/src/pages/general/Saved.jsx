import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import axios from 'axios'
import ReelFeed from '../../components/ReelFeed'

const Saved = () => {
    const [videos, setVideos] = useState([])

    useEffect(() => {
        axios.get("http://localhost:3000/api/food/save", { withCredentials: true })
            .then(response => {
                const savedFoods = response.data?.savedFoods

                if (!savedFoods || savedFoods.length === 0) {
                    setVideos([])
                    return
                }

                setVideos(
                    savedFoods
                        .filter(item => item?.food)
                        .map(item => ({
                            _id: item.food._id,
                            video: item.food.video,
                            description: item.food.description,
                            likeCount: item.food.likeCount ?? 0,
                            savesCount: item.food.savesCount ?? 0,
                            commentsCount: item.food.commentsCount ?? 0,
                            foodPartner: item.food.foodPartner,
                        }))
                )
            })
            .catch(err => {
                console.error("Saved fetch error:", err.response?.status)
                setVideos([])
            })
    }, [])

    const removeSaved = async (item) => {
        try {
            await axios.post("http://localhost:3000/api/food/save",
                { foodId: item._id },
                { withCredentials: true }
            )
            setVideos(prev => prev.filter(v => v._id !== item._id))
        } catch {
            // noop
        }
    }

    return (
        <ReelFeed
            items={videos}
            onSave={removeSaved}
            emptyMessage="No saved videos yet."
        />
    )
}

export default Saved