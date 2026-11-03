import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'cloudinary.spec.ts',timeout:120000,workers:1,retries:0,
reporter:[['list'],['json',{outputFile:'artifacts/report-chapter3/revision-fhd/cloudinary-results.json'}]],
outputDir:'test-output',use:{baseURL:'http://localhost:5173',browserName:'chromium',viewport:{width:1920,height:1080},trace:'off',screenshot:'off',video:'off'}});
