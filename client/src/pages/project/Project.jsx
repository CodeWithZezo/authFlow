import { useParams } from "react-router-dom";
import React from 'react'

const Project = () => {
  const { orgslug } = useParams();
  const { projectId } = useParams();
    return (
    <div>Project for Organization: {orgslug} and Project ID: {projectId}</div>
  )
}

export default Project

