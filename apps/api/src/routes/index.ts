import { Router } from "express";
import statsRouter from "./stats";
import trendsRouter from "./invoice-trends";
import vendorsRouter from "./vendors";
import categoriesRouter from "./categories";
import cashflowRouter from "./cash-outflow";
import invoicesRouter from "./invoices";
import chatRouter from "./chat";

const router = Router();

router.use("/stats", statsRouter);
router.use("/invoice-trends", trendsRouter);
router.use("/vendors", vendorsRouter);
router.use("/category-spend", categoriesRouter);
router.use("/cash-outflow", cashflowRouter);
router.use("/invoices", invoicesRouter);
router.use("/chat-with-data", chatRouter);

export default router;
