import { Button } from "@chakra-ui/button";
import useShowToast from "../../hooks/useShowToast";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { BiPowerOff } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const showToast = useShowToast();
  const setUser = useSetRecoilState(userAtom); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/v1/users/logout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log(data);

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      localStorage.removeItem("user-tootar");
      setUser(null);
      navigate("/auth");
    } catch (error) {
      showToast("Error", error, "error");
    }
  };
  return (
    <Button
      position={"fixed"}
      top={"30px"}
      right={"30px"}
      size={"sm"}
      onClick={handleLogout}
    >
      <BiPowerOff size={25} color="red" />
    </Button>
  );
};

export default LogoutButton;
