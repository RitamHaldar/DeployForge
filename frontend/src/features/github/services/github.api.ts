import axios from "axios";
import type { GitResponse } from "../../auth";
import type { DeployPayload } from "../types";

const api = axios.create({
  baseURL: "/api/github",
  withCredentials: true
})

const api2=axios.create({
  baseURL:"/api/k8s",
  withCredentials:true
})

export async function GetRepos(): Promise<GitResponse[]> {
  const response = await api.get<GitResponse[]>("/repos");
  return response.data;
}

export async function Deploy(payload: DeployPayload) {
  const response = await api2.post("/deploy", payload);
  return response.data;
}