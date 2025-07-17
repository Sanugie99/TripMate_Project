// src/context/PostContext.js
import React, { createContext, useState } from "react";

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [loading] = useState(false);

  const [users] = useState([
    {
      user_id: 1,
      name: "더미 사용자",
      username: "dummyUser",
      intro: "소개글입니다.",
      email: "dummy@example.com",
      profile_img: "https://via.placeholder.com/100",
    },
    {
      user_id: 2,
      name: "다른 사용자",
      username: "user2",
      intro: "다른 소개글",
      email: "user2@example.com",
      profile_img: "https://via.placeholder.com/100",
    },
  ]);

  const [posts] = useState([
    {
      post_id: 101,
      writer_id: 1,
      title: "첫 번째 게시글",
    },
    {
      post_id: 102,
      writer_id: 1,
      title: "두 번째 게시글",
    },
    {
      post_id: 103,
      writer_id: 2,
      title: "다른 사용자의 게시글",
    },
  ]);

  const [contents] = useState([
    { _post_id: 101, img_src: "https://via.placeholder.com/150" },
    { _post_id: 101, img_src: "https://via.placeholder.com/150" },
    { _post_id: 102, img_src: "https://via.placeholder.com/150" },
  ]);

  const [categories] = useState([
    { post_id: 101, category_name: "여행" },
    { post_id: 101, category_name: "맛집" },
    { post_id: 102, category_name: "일상" },
  ]);

  return (
    <PostContext.Provider
      value={{ posts, users, contents, categories, loading }}
    >
      {children}
    </PostContext.Provider>
  );
};
