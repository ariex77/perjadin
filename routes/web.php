<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Report;
use Illuminate\Http\Request;

use App\Models\InCityReport;
use App\Models\OutCityReport;
use App\Models\TravelReport;

use App\Http\Controllers\Systems\RoleController;
use App\Http\Controllers\Masters\FullboardPriceController;
use App\Http\Controllers\Masters\WorkUnitController;
use App\Http\Controllers\Masters\EmployeeController;
use App\Http\Controllers\Assignments\AssignmentController;
use App\Http\Controllers\AssignmentEmployeeController;
use App\Http\Controllers\Reports\ReportController;

use App\Http\Controllers\Reports\AssignmentDocumentationController;
use App\Http\Controllers\Reports\InCityReportController;
use App\Http\Controllers\Reports\OutCityReportController;
use App\Http\Controllers\Reports\TravelReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// Route Model Binding
Route::model('user', User::class);
Route::model('report', Report::class);

Route::model('assignmentDocumentation', \App\Models\AssignmentDocumentation::class);
Route::model('inCityReport', InCityReport::class);
Route::model('outCityReport', OutCityReport::class);
Route::model('travelReport', TravelReport::class);

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Debug route untuk testing
Route::get('/test-debug', function () {
    \Log::info('Debug route accessed');
    dd('Debug route working!');
});



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::resource('assignments', AssignmentController::class);
    Route::post('assignments/bulk-delete', [AssignmentController::class, 'bulkDelete'])
        ->name('assignments.bulk-delete');
    
    // Assignment Documentation routes
    Route::prefix('assignments/{assignment}/documentation')->name('assignments.documentation.')->group(function () {
        Route::post('/', [AssignmentDocumentationController::class, 'store'])->name('store');
        Route::delete('{assignmentDocumentation}', [AssignmentDocumentationController::class, 'destroy'])->name('destroy');
    });
    
    // Assignment Employee routes
    Route::prefix('assignment-employees')->name('assignment-employees.')->group(function () {
        Route::get('/', [AssignmentEmployeeController::class, 'index'])->name('index');
        Route::get('{assignmentEmployee}', [AssignmentEmployeeController::class, 'show'])->name('show');
        Route::get('by-assignment/{assignmentId}', [AssignmentEmployeeController::class, 'byAssignment'])->name('by-assignment');
        Route::get('by-user/{userId}', [AssignmentEmployeeController::class, 'byUser'])->name('by-user');
    });
    
    // Reports prefix - semua route yang berhubungan dengan reports
    Route::prefix('reports')->name('reports.')->group(function () {
        // Main reports resource
        Route::resource('/', ReportController::class)->parameters(['' => 'report']);
        Route::post('{report}/review', [ReportController::class, 'review'])->name('review');
        Route::post('{report}/submit', [ReportController::class, 'submit'])->name('submit');
        Route::get('{report}/download-expense', [ReportController::class, 'downloadExpenseReport'])->name('download-expense');
        Route::get('{report}/download-travel', [ReportController::class, 'downloadTravelReport'])->name('download-travel');

        

        Route::resource('{report}/in-city-reports', InCityReportController::class)->parameters(['in-city-reports' => 'inCityReport'])->except(['index', 'show', 'create', 'edit', 'destroy']);   
        Route::resource('{report}/out-city-reports', OutCityReportController::class)->parameters(['out-city-reports' => 'outCityReport'])->except(['index', 'show', 'create', 'edit', 'destroy']);   
        Route::resource('{report}/travel-reports', TravelReportController::class)->parameters(['travel-reports' => 'travelReport'])->except(['index', 'show', 'create', 'edit', 'destroy']);   
        

    });

    Route::prefix('masters')->name('masters.')->middleware('role:superadmin|admin')->group(function () {
        Route::resource('work-units', WorkUnitController::class);
        Route::post('work-units/bulk-delete', [WorkUnitController::class, 'bulkDelete'])->name('work-units.bulk-delete');
        
        Route::resource('employees', EmployeeController::class)->parameters(['employees' => 'user']);
        Route::post('employees/bulk-delete', [EmployeeController::class, 'bulkDelete'])->name('employees.bulk-delete');

        Route::resource('fullboard-prices', FullboardPriceController::class);
        Route::post('fullboard-prices/bulk-delete', [FullboardPriceController::class, 'bulkDelete'])->name('fullboard-prices.bulk-delete');
    });

     // System routes - hanya untuk superadmin
    Route::prefix('systems')->name('systems.')->middleware('role:superadmin')->group(function () {
        Route::get('roles', [RoleController::class, 'index'])->name('roles.index');

        // Route::resource('administrations', AdministrationController::class);
        // Route::post('administrations/bulk-delete', [AdministrationController::class, 'bulkDelete'])->name('administrations.bulk-delete');
    });
});
Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
