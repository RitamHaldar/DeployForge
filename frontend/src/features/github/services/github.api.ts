import axios from "axios";
import type { GitResponse } from "../../auth";

const api = axios.create({
  baseURL: "/api/github",
  withCredentials: true
})

export async function GetRepos(): Promise<GitResponse[]> {
  const response = await api.get<GitResponse[]>("/repos");
  return response.data;
}