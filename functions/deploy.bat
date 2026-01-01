@echo off
echo ============================================
echo Deploying Cloud Functions to Google Cloud
echo ============================================
echo.

cd /d %~dp0

echo [1/7] Deploying on_credit_transaction...
call gcloud functions deploy on_credit_transaction --gen2 --runtime=python311 --region=us-central1 --source=. --entry-point=on_credit_transaction --trigger-event-filters="type=google.cloud.firestore.document.v1.written" --trigger-event-filters="database=(default)" --trigger-location=nam5 --trigger-event-filters-path-pattern="document=users/{userId}/credit_transactions/{txId}" --quiet
if errorlevel 1 (echo FAILED! & pause & exit /b 1)

echo.
echo [2/7] Deploying on_resume_created...
call gcloud functions deploy on_resume_created --gen2 --runtime=python311 --region=us-central1 --source=. --entry-point=on_resume_created --trigger-event-filters="type=google.cloud.firestore.document.v1.created" --trigger-event-filters="database=(default)" --trigger-location=nam5 --trigger-event-filters-path-pattern="document=resumes/{resumeId}" --quiet
if errorlevel 1 (echo FAILED! & pause & exit /b 1)

echo.
echo [3/7] Deploying on_resume_deleted...
call gcloud functions deploy on_resume_deleted --gen2 --runtime=python311 --region=us-central1 --source=. --entry-point=on_resume_deleted --trigger-event-filters="type=google.cloud.firestore.document.v1.deleted" --trigger-event-filters="database=(default)" --trigger-location=nam5 --trigger-event-filters-path-pattern="document=resumes/{resumeId}" --quiet
if errorlevel 1 (echo FAILED! & pause & exit /b 1)

echo.
echo [4/7] Deploying on_portfolio_updated...
call gcloud functions deploy on_portfolio_updated --gen2 --runtime=python311 --region=us-central1 --source=. --entry-point=on_portfolio_updated --trigger-event-filters="type=google.cloud.firestore.document.v1.written" --trigger-event-filters="database=(default)" --trigger-location=nam5 --trigger-event-filters-path-pattern="document=portfolio_sessions/{sessionId}" --quiet
if errorlevel 1 (echo FAILED! & pause & exit /b 1)

echo.
echo [5/7] Deploying on_template_purchased...
call gcloud functions deploy on_template_purchased --gen2 --runtime=python311 --region=us-central1 --source=. --entry-point=on_template_purchased --trigger-event-filters="type=google.cloud.firestore.document.v1.created" --trigger-event-filters="database=(default)" --trigger-location=nam5 --trigger-event-filters-path-pattern="document=unlocked_templates/{templateId}" --quiet
if errorlevel 1 (echo FAILED! & pause & exit /b 1)

echo.
echo [6/7] Deploying reset_daily_stats...
call gcloud functions deploy reset_daily_stats --gen2 --runtime=python311 --region=us-central1 --source=. --entry-point=reset_daily_stats --trigger-http --allow-unauthenticated --quiet
if errorlevel 1 (echo FAILED! & pause & exit /b 1)

echo.
echo [7/7] Deploying update_user_count...
call gcloud functions deploy update_user_count --gen2 --runtime=python311 --region=us-east1 --source=. --entry-point=update_user_count --trigger-http --allow-unauthenticated --quiet
if errorlevel 1 (echo FAILED! & pause & exit /b 1)

echo.
echo ============================================
echo SUCCESS! All functions deployed!
echo ============================================
echo.
echo Next steps:
echo 1. Set up Cloud Scheduler jobs (see DEPLOYMENT.md)
echo 2. Test functions by creating transactions
echo 3. Monitor logs: gcloud functions logs read on_credit_transaction --gen2
echo.
pause
