import { PaginationFilter } from "../abstraction/pagination.filter";
import { SearchFilter } from "../abstraction/search.filter";

export interface UserCheckEventFilter extends PaginationFilter, SearchFilter {
    initialDate?: string;
    finalDate?: string;
}