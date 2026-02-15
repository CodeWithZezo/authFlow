import { useParams } from "react-router-dom";

const Organization = () => {
  const { orgslug } = useParams();

  

  return (
    <div>
      <h1>Organization: {orgslug}</h1>
    </div>
  );
};

export default Organization;