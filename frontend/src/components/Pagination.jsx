import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, onPageChange }) => {
    const canPrev = page > 1;
    const canNext = page < totalPages;

    const handlePrev = () => {
        if (!canPrev) return;
        onPageChange(page - 1);
    };

    const handleNext = () => {
        if (!canNext) return;
        onPageChange(page + 1);
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
            <div className="text-xs text-gray-500">
                Page {page} of {totalPages}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handlePrev}
                    disabled={!canPrev}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                </button>
                <button
                    onClick={handleNext}
                    disabled={!canNext}
                    className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50"
                >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
