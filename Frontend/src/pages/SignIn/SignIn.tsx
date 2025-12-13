import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../../hooks";
import toast from "react-hot-toast";
import { ButtonWrapper, Container, TextWrapper, Wrapper } from "./Style";
import api from "../../services/api";
import styled from "styled-components";

const Input = styled.input`
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
`;

export default function SignIn() {
  const { currentUser, setCurrentUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isSignUp ? "/auth/signup" : "/auth/login";
      const payload = isSignUp
        ? { email, password, displayName }
        : { email, password };

      const response = await api.post(endpoint, payload);

      if (isSignUp) {
        toast.success("Account created! Please log in.");
        setIsSignUp(false);
      } else {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setCurrentUser(response.data.user);
        toast.success("Signed In! ✅");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) return <Navigate to="/" />;

  return (
    <Container>
      <img
        src="/home.png"
        alt="A picture of a chat bubble with a girl in it."
      />
      <Wrapper>
        <TextWrapper>
          <h1>Chatify</h1>
          <h2>
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </h2>
        </TextWrapper>

        <Form onSubmit={handleAuth}>
          {isSignUp && (
            <Input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <ButtonWrapper>
            <button disabled={loading} type="submit">
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </ButtonWrapper>
        </Form>

        <p style={{ marginTop: "1rem", cursor: "pointer", color: "blue" }} onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </p>

        {/* <a href="https://github.com/mirayatech" target="_blank" style={{ marginTop: "20px" }}>
          Built & D
        </a> */}
      </Wrapper>
    </Container>
  );
}
